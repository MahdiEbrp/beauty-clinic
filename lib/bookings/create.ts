import { and, eq, gte, lte, ne, notInArray, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { bookings, bookingSlotGroups, bookingSlots } from "@/src/db/schema";
import type { Locale } from "@/lib/services/types";
import { toMoney } from "./money";
import { snapshotGroups } from "./snapshot";
import { MAX_ADVANCE_DAYS } from "./errors";
import { computeSlotStatus } from "./slot-status";
import { ensureCustomerUser } from "@/lib/users/customers";

export { toMoney } from "./money";
export function toLocalTimestamp(date: string, time: string): Date {
  // `date` = YYYY-MM-DD, `time` = HH:MM:SS → local "YYYY-MM-DDTHH:MM:SS".
  return new Date(`${date}T${time}`);
}


type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Linked group ids for a slot ("empty = every group"). */
async function slotGroupIds(tx: Tx, slotId: string): Promise<string[]> {
  const rows = await tx
    .select({ groupId: bookingSlotGroups.groupId })
    .from(bookingSlotGroups)
    .where(eq(bookingSlotGroups.slotId, slotId));
  return rows.map((r) => r.groupId);
}

export type BookingSummary = typeof bookings.$inferSelect;

export type BookingItemInput = {
  groupId: string;
  slotId: string;
  quantity: number;
};

export type BookingGroupInput = {
  fullName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  locale: Locale;
  consultationRequired?: boolean;
  hasAllergies?: boolean;
  isPregnant?: boolean;
  /** Acceptance of the clinic booking rules (required for public orders). */
  termsAccepted?: boolean;
  items: BookingItemInput[];
};

/** NF-XXXXX style group reference, cryptographically random. */
function generateGroupRef(): string {
  const roll = crypto.getRandomValues(new Uint32Array(1))[0];
  const n = (roll % 90000) + 10000;
  return `NF-${n.toString()}`;
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Creates a multi-group booking order atomically.
 *
 * Concurrency rule (never oversell): every slot referenced by the order is
 * locked with `SELECT … FOR UPDATE` in a deterministic (sorted) order inside
 * ONE transaction. While holding the lock we re-count active seats; if
 * `existing + requested > capacity` the whole order rolls back with 409.
 * Two customers racing on the same slot are serialized by the row lock —
 * exactly one wins. Different slots never block each other.
 *
 * Only the single fixed deposit (`booking.price`) is charged for the whole
 * order; service prices are never read or stored.
 */
export async function createBookingGroup(input: BookingGroupInput): Promise<{
  groupRef: string;
  items: BookingSummary[];
  deposit: number;
}> {
  const settings = await loadSystemSettingsMap();
  const deposit = toMoney(settings.get("booking.price"));
  const currency = (settings.get("booking.currency") as string) ?? "تومان";
  const now = Date.now();
  const groupRef = generateGroupRef();

  // Aggregate requested seats per slot; several groups may share one slot.
  const perSlot = new Map<string, number>();
  for (const item of input.items) {
    perSlot.set(item.slotId, (perSlot.get(item.slotId) ?? 0) + item.quantity);
  }
  const slotIds = [...perSlot.keys()].sort(); // deterministic lock order (no deadlock)

  const snapshots = await snapshotGroups(
    input.items.map((i) => i.groupId),
    input.locale,
  );

  return db.transaction(async (tx) => {
    const slotRows = new Map<
      string,
      { date: string; start: string; end: string; capacity: number; groupIds: string[] }
    >();

    // Phase 1 — lock every slot, then validate it under the lock.
    for (const slotId of slotIds) {
      const [row] = await tx
        .select()
        .from(bookingSlots)
        .where(eq(bookingSlots.id, slotId))
        .limit(1)
        .for("update");

      if (!row) throw new ApiError(404, "SLOT_NOT_FOUND", "Slot not found.");
      if (computeSlotStatus(row.isActive, row.slotDate, row.endTime) !== "active") {
        throw new ApiError(409, "SLOT_UNAVAILABLE", "This slot is no longer available.");
      }
      const slotStart = toLocalTimestamp(row.slotDate, row.startTime);
      const slotEnd = toLocalTimestamp(row.slotDate, row.endTime);
      if (slotStart.getTime() <= now) {
        throw new ApiError(400, "PAST_SLOT", "This time slot has already passed.");
      }
      if (slotStart.getTime() > now + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000) {
        throw new ApiError(400, "TOO_FAR_AHEAD", "This date is too far in advance to book.");
      }
      const groupIds = await slotGroupIds(tx, slotId);
      slotRows.set(slotId, {
        date: row.slotDate,
        start: row.startTime,
        end: row.endTime,
        capacity: row.capacity,
        groupIds,
      });
    }

    // Phase 2 — seat counting + customer-overlap checks under the locks.
    const allocated = new Map<string, number>(); // seats this order adds per slot
    const planned: {
      groupId: string;
      slotId: string;
      quantity: number;
      start: Date;
      end: Date;
    }[] = [];

    for (const item of input.items) {
      const slot = slotRows.get(item.slotId);
      if (!slot) continue; // unreachable — slotIds derive from the same items
      const start = toLocalTimestamp(slot.date, slot.start);
      const end = toLocalTimestamp(slot.date, slot.end);

      const totalRequested = (allocated.get(item.slotId) ?? 0) + item.quantity;
      const [used] = await tx
        .select({ seats: sql<number>`coalesce(sum(${bookings.quantity}), 0)::int` })
        .from(bookings)
        .where(and(eq(bookings.slotId, item.slotId), notInArray(bookings.status, ["done", "refunded"])));
      if (Number(used?.seats ?? 0) + totalRequested > slot.capacity) {
        throw new ApiError(409, "SLOT_FULL", "This time slot has just been taken.");
      }

      if (slot.groupIds.length > 0 && !slot.groupIds.includes(item.groupId)) {
        throw new ApiError(409, "GROUP_UNAVAILABLE", "This slot does not offer the selected group.");
      }

      // Same customer, overlapping time, outside this new group → conflict.
      const [conflict] = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.phone, input.phone),
            notInArray(bookings.status, ["done", "refunded"]),
            ne(bookings.groupRef, groupRef),
            lte(bookings.slotStart, end),
            gte(bookings.slotEnd, start),
          ),
        )
        .limit(1);
      if (conflict) {
        throw new ApiError(409, "CUSTOMER_CONFLICT", "You already have a booking at this time.");
      }

      // Overlap against other lines of THIS group on different slots.
      for (const other of planned) {
        if (other.slotId !== item.slotId && overlap(start, end, other.start, other.end)) {
          throw new ApiError(409, "CUSTOMER_CONFLICT", "Selected groups overlap in time.");
        }
      }

      allocated.set(item.slotId, totalRequested);
      planned.push({ ...item, start, end });
    }

    // Phase 3 — link/auto-provision the customer, then insert the group rows
    // (still inside the locked transaction, so a failed order leaves no user).
    const customerId = await ensureCustomerUser(tx, {
      phone: input.phone,
      fullName: input.fullName,
      email: input.email,
    });

    // The fixed deposit is stored once per booking order. Put it on the
    // first line and zero on the remaining lines so summing the order never
    // multiplies the configured deposit by the number of selected services.
    const inserted: BookingSummary[] = [];
    for (const [lineIndex, line] of planned.entries()) {
      const group = snapshots.get(line.groupId);
      if (!group) throw new ApiError(404, "GROUP_NOT_FOUND", "Group not found.");
      const [row] = await tx
        .insert(bookings)
        .values({
          groupRef,
          customerId,
          fullName: input.fullName,
          phone: input.phone,
          email: input.email ?? null,
          groupId: line.groupId,
          groupTitle: group.title,
          currency,
          quantity: line.quantity,
          slotId: line.slotId,
          slotStart: line.start,
          slotEnd: line.end,
          totalAmount: String(lineIndex === 0 ? deposit : 0),
          status: "pending",
          notes: input.notes ?? null,
          consultationRequired: input.consultationRequired ?? false,
          hasAllergies: input.hasAllergies ?? false,
          isPregnant: input.isPregnant ?? false,
          termsAcceptedAt: input.termsAccepted ? new Date() : null,
        })
        .returning();
      inserted.push(row);
    }

    return { groupRef, items: inserted, deposit };
  });
}

/**
 * Backwards-compatible single-group creation (admin API) — a one-item order
 * that enjoys the same FOR UPDATE oversell protection.
 */
export async function createBooking(input: {
  fullName: string;
  phone: string;
  email?: string | null;
  groupId: string;
  slotId: string;
  notes?: string | null;
  locale: Locale;
}): Promise<BookingSummary> {
  const group = await createBookingGroup({
    ...input,
    items: [{ groupId: input.groupId, slotId: input.slotId, quantity: 1 }],
  });
  return group.items[0];
}
