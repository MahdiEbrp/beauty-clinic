import { and, eq, gte, inArray, lte, ne, notInArray, or, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookingSlotGroups, bookings, bookingSlots } from "@/src/db/schema";
import { existingSlotKeys, requireSlot, replaceSlotGroups } from "./slot-support";
import { computeSlotStatus, type SlotStatus } from "./slot-status";
import { hhmm, minutesOf, planWindowSlots } from "./generator-utils";

export type SlotSummary = {
  id: string;
  groupIds: string[];
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  /** Derived on read: active | inactive | expired. */
  status: SlotStatus;
  bookedCount: number;
  available: boolean;
};

type SlotRow = typeof bookingSlots.$inferSelect;

function toSummary(row: SlotRow, bookedCount: number, groupIds: string[]): SlotSummary {
  const status = computeSlotStatus(row.isActive, row.slotDate, row.endTime);
  return {
    id: row.id,
    groupIds,
    slotDate: row.slotDate,
    startTime: row.startTime,
    endTime: row.endTime,
    capacity: row.capacity,
    isActive: row.isActive,
    status,
    bookedCount,
    available: status === "active" && bookedCount < row.capacity,
  };
}

/** Active (non-done/refunded) booking counts per slot, batch-aggregated. */
async function bookedCounts(slotIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (slotIds.length === 0) return map;

  const rows = await db
    .select({
      slotId: bookings.slotId,
      count: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(
      and(
        inArray(bookings.slotId, slotIds),
        notInArray(bookings.status, ["done", "refunded"]),
        sql`${bookings.slotId} IS NOT NULL`,
      ),
    )
    .groupBy(bookings.slotId);

  for (const row of rows) {
    if (row.slotId) map.set(row.slotId, Number(row.count));
  }
  return map;
}

/** Linked group ids per slot, batch-loaded (empty array = all groups). */
async function slotGroupsMap(slotIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (slotIds.length === 0) return map;

  const rows = await db
    .select({
      slotId: bookingSlotGroups.slotId,
      groupId: bookingSlotGroups.groupId,
    })
    .from(bookingSlotGroups)
    .where(inArray(bookingSlotGroups.slotId, slotIds));

  for (const row of rows) {
    const list = map.get(row.slotId);
    if (list) list.push(row.groupId);
    else map.set(row.slotId, [row.groupId]);
  }
  return map;
}

/**
 * True when a slot accepts every group (`NOT EXISTS` link rows); otherwise
 * it must have an explicit link to the requested group.
 */
function groupCompatibility(groupId: string) {
  const noLinks = sql`NOT EXISTS (
    SELECT 1 FROM ${bookingSlotGroups} bsg WHERE bsg.slot_id = ${bookingSlots.id}
  )`;
  const hasLink = sql`EXISTS (
    SELECT 1 FROM ${bookingSlotGroups} bsg
    WHERE bsg.slot_id = ${bookingSlots.id} AND bsg.group_id = ${groupId}
  )`;
  return or(hasLink, noLinks);
}

export async function listSlots(opts: {
  from?: string;
  to?: string;
  groupId?: string;
}): Promise<SlotSummary[]> {
  const conditions = [];
  if (opts.from) conditions.push(gte(bookingSlots.slotDate, opts.from));
  if (opts.to) conditions.push(lte(bookingSlots.slotDate, opts.to));
  if (opts.groupId) conditions.push(groupCompatibility(opts.groupId));

  const rows = await db
    .select()
    .from(bookingSlots)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(bookingSlots.slotDate, bookingSlots.startTime);

  const [counts, links] = await Promise.all([
    bookedCounts(rows.map((r) => r.id)),
    slotGroupsMap(rows.map((r) => r.id)),
  ]);
  return rows.map((row) =>
    toSummary(row, counts.get(row.id) ?? 0, links.get(row.id) ?? []),
  );
}

export async function listSlotsByDate(
  slotDate: string,
  groupId?: string,
): Promise<SlotSummary[]> {
  return listSlots({ from: slotDate, to: slotDate, groupId });
}

/** Only slots that can still accept a booking today. */
export async function availableSlots(
  slotDate: string,
  groupId?: string,
): Promise<SlotSummary[]> {
  const rows = await listSlots({ from: slotDate, to: slotDate, groupId });
  return rows.filter((s) => s.available);
}

/**
 * Slots suitable for one shared time across multiple selected service groups.
 * Unlinked slots accept every group; linked slots must include all requested
 * groups. Capacity is checked against the total number of seats the order adds
 * to this one shared slot, mirroring createBookingGroup's atomic validation.
 */
export async function availableSlotsForGroups(
  slotDate: string,
  groupIds: string[],
  quantity: number,
): Promise<SlotSummary[]> {
  const selected = [...new Set(groupIds)];
  if (selected.length === 0 || quantity < 1) return [];
  const rows = await listSlots({ from: slotDate, to: slotDate });
  return rows.filter((slot) =>
    slot.available &&
    slot.capacity - slot.bookedCount >= quantity &&
    (slot.groupIds.length === 0 || selected.every((id) => slot.groupIds.includes(id))),
  );
}

export async function createSlots(
  input: {
    groupIds?: string[];
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }[],
  createdBy?: string,
): Promise<SlotSummary[]> {
  const now = Date.now();
  for (const item of input) {
    if (new Date(`${item.slotDate}T${item.endTime}`).getTime() <= now) {
      throw new ApiError(400, "PAST_SLOT_TIME", "Slot end time must be in the future.");
    }
  }

  // The (slot_date, start_time) unique index makes duplicates impossible; skip
  // any that already exist and create the rest (idempotent, like the generator).
  const existing = await existingSlotKeys(input);
  const toCreate = input.filter((item) => {
    const key = `${item.slotDate}|${item.startTime}`;
    if (existing.has(key)) return false;
    existing.add(key);
    return true;
  });

  if (toCreate.length === 0) return [];

  const rows = await db
    .insert(bookingSlots)
    .values(
      toCreate.map((i) => ({
        slotDate: i.slotDate,
        startTime: i.startTime,
        endTime: i.endTime,
        capacity: i.capacity,
        createdBy: createdBy ?? null,
      })),
    )
    .returning();

  // One bulk insert per unique link set keeps queries low even for batches.
  const links = toCreate.flatMap((item, index) =>
    (item.groupIds ?? []).map((groupId) => ({
      slotId: rows[index]?.id,
      groupId,
    })),
  );
  const validLinks = links.filter((l): l is { slotId: string; groupId: string } => Boolean(l.slotId));
  if (validLinks.length > 0) await db.insert(bookingSlotGroups).values(validLinks);

  const ids = rows.map((r) => r.id);
  const [counts, groupMap] = await Promise.all([
    bookedCounts(ids),
    slotGroupsMap(ids),
  ]);
  return rows.map((row, index) =>
    toSummary(
      row,
      counts.get(row.id) ?? 0,
      groupMap.get(row.id) ?? toCreate[index]?.groupIds ?? [],
    ),
  );
}

/**
 * Bulk-generates slots for a date range on selected weekdays within a time
 * window. Idempotent: existing (date, start_time) rows are skipped.
 * Returns the created slots.
 */
export async function bulkGenerateSlots(input: {
  fromDate: string;
  toDate: string;
  daysOfWeek: string[];
  opens: string;
  closes: string;
  intervalMin: number;
  durationMin: number;
  capacity: number;
  groupIds?: string[];
}): Promise<SlotSummary[]> {
  const from = new Date(`${input.fromDate}T12:00:00Z`);
  const to = new Date(`${input.toDate}T12:00:00Z`);
  if (to.getTime() < from.getTime()) {
    throw new ApiError(400, "INVALID_DATE_RANGE", "To date must be after from date.");
  }

  const present = new Set(input.daysOfWeek);
  const window = { opens: input.opens, closes: input.closes };
  const starts = planWindowSlots(window, input.intervalMin, input.durationMin);

  // Collect all (date, start_time) pairs to create, one batch per date.
  const toCreate: {
    groupIds?: string[];
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }[] = [];

  const cursor = new Date(from);
  while (cursor <= to) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const day = String(cursor.getUTCDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][cursor.getUTCDay()] ?? "";

    if (present.has(weekday)) {
      for (const start of starts) {
        toCreate.push({
          slotDate: dateKey,
          startTime: start,
          endTime: hhmm(minutesOf(start) + input.durationMin),
          capacity: input.capacity,
          groupIds: input.groupIds,
        });
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (toCreate.length === 0) return [];

  return createSlots(toCreate);
}

export async function getSlot(id: string): Promise<SlotSummary> {
  const row = await requireSlot(id);
  const [counts, groupMap] = await Promise.all([
    bookedCounts([row.id]),
    slotGroupsMap([row.id]),
  ]);
  return toSummary(row, counts.get(row.id) ?? 0, groupMap.get(row.id) ?? []);
}

/** Replaces the slot ↔ group links wholesale (delete + insert). */
export async function updateSlot(
  id: string,
  patch: {
    groupIds?: string[];
    slotDate?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    isActive?: boolean;
  },
): Promise<SlotSummary> {
  const existing = await requireSlot(id);

  const nextEnd = patch.endTime ?? existing.endTime;
  const nextStart = patch.startTime ?? existing.startTime;
  if (nextEnd <= nextStart) {
    throw new ApiError(400, "INVALID_SLOT_TIME", "End time must be after start time.");
  }

  // Moving a slot onto an already-taken (date, start_time) is a clean 409
  // instead of a unique-violation 500.
  if (patch.slotDate || patch.startTime) {
    const nextDate = patch.slotDate ?? existing.slotDate;
    const [collision] = await db
      .select({ id: bookingSlots.id })
      .from(bookingSlots)
      .where(
        and(
          eq(bookingSlots.slotDate, nextDate),
          eq(bookingSlots.startTime, nextStart),
          ne(bookingSlots.id, id),
        ),
      )
      .limit(1);
    if (collision) {
      throw new ApiError(
        409,
        "SLOT_EXISTS",
        "A slot already exists at this date and time.",
      );
    }
  }

  const { groupIds, ...rest } = patch;
  const [row] = await db
    .update(bookingSlots)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(bookingSlots.id, id))
    .returning();

  if (groupIds) await replaceSlotGroups(id, groupIds);

  const [counts, groupMap] = await Promise.all([
    bookedCounts([id]),
    slotGroupsMap([id]),
  ]);
  return toSummary(row, counts.get(id) ?? 0, groupMap.get(id) ?? []);
}

export async function deleteSlot(id: string): Promise<void> {
  await requireSlot(id);

  const [ref] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.slotId, id))
    .limit(1);
  if (ref) {
    throw new ApiError(
      409,
      "SLOT_HAS_BOOKINGS",
      "This slot has reservations and cannot be deleted.",
    );
  }

  await db.delete(bookingSlots).where(eq(bookingSlots.id, id));
}
