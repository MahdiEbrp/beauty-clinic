import { and, eq, gt, lt, notInArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema";
import type { Locale } from "@/lib/services/types";
import { toMoney } from "./money";
import { snapshotGroups } from "./snapshot";
import { loadLockedSlots } from "./locked-slots";
import { ensureCustomerUser } from "@/lib/users/customers";

export { toMoney } from "./money";
export function toLocalTimestamp(date: string, time: string): Date {
  // `date` = YYYY-MM-DD, `time` = HH:MM:SS → local "YYYY-MM-DDTHH:MM:SS".
  return new Date(`${date}T${time}`);
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
  /** Unit lines must occupy adjacent slots in request order. */
  sequential?: boolean;
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
  if (input.items.length === 0) throw new ApiError(400, "SLOT_UNAVAILABLE", "Select services first.");
  const now = Date.now();
  const groupRef = generateGroupRef();

  // Aggregate requested seats per slot; several groups may share one slot.
  const perSlot = new Map<string, number>();
  for (const item of input.items) {
    perSlot.set(item.slotId, (perSlot.get(item.slotId) ?? 0) + item.quantity);
  }
  const slotIds = [...perSlot.keys()].sort(); // deterministic lock order (no deadlock)

  const snapshots = await snapshotGroups(
    [...new Set(input.items.map((i) => i.groupId))],
    input.locale,
  );

  return db.transaction(async (tx) => {
    const slotRows = await loadLockedSlots(tx, slotIds, now);
    const starts = [...slotRows.values()].map((slot) => toLocalTimestamp(slot.date, slot.start).getTime());
    const ends = [...slotRows.values()].map((slot) => toLocalTimestamp(slot.date, slot.end).getTime());
    const customerBookings = await tx.select({ start: bookings.slotStart, end: bookings.slotEnd })
      .from(bookings).where(and(
        eq(bookings.phone, input.phone), notInArray(bookings.status, ["done", "refunded"]),
        lt(bookings.slotStart, new Date(Math.max(...ends))),
        gt(bookings.slotEnd, new Date(Math.min(...starts))),
      ));

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
      if (slot.used + totalRequested > slot.capacity) {
        throw new ApiError(409, "SLOT_FULL", "This time slot has just been taken.");
      }

      if (slot.groupIds.length > 0 && !slot.groupIds.includes(item.groupId)) {
        throw new ApiError(409, "GROUP_UNAVAILABLE", "This slot does not offer the selected group.");
      }

      // Half-open intervals allow a new service to begin exactly when another ends.
      if (customerBookings.some((row) => row.start && row.end && overlap(start, end, row.start, row.end))) {
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

    // All times above were re-read under row locks: a stale/tampered plan
    // cannot create gaps, repeated slots or multiple services in one slot.
    if (input.sequential) {
      const seen = new Set<string>();
      for (const [index, line] of planned.entries()) {
        const previous = planned[index - 1];
        if (line.quantity !== 1 || seen.has(line.slotId) ||
          (previous && (previous.end.getTime() !== line.start.getTime() ||
            previous.start.toDateString() !== line.start.toDateString()))) {
          throw new ApiError(409, "SLOT_UNAVAILABLE", "Select consecutive slots for all services.");
        }
        seen.add(line.slotId);
      }
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
    const values = planned.map((line, lineIndex) => {
      const group = snapshots.get(line.groupId);
      if (!group) throw new ApiError(404, "GROUP_NOT_FOUND", "Group not found.");
      return {
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
          status: "pending" as const,
          notes: input.notes ?? null,
          consultationRequired: input.consultationRequired ?? false,
          hasAllergies: input.hasAllergies ?? false,
          isPregnant: input.isPregnant ?? false,
          termsAcceptedAt: input.termsAccepted ? new Date() : null,
      };
    });
    const inserted = await tx.insert(bookings).values(values).returning();

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
