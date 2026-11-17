import { and, gte, inArray, lte, notInArray, or, sql } from "drizzle-orm";

import { db } from "@/src/db";
import { bookingSlotGroups, bookings, bookingSlots } from "@/src/db/schema";
import { computeSlotStatus, type SlotStatus } from "./slot-status";

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

export function toSummary(row: SlotRow, bookedCount: number, groupIds: string[]): SlotSummary {
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
export async function bookedCounts(slotIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (slotIds.length === 0) return map;

  const rows = await db
    .select({
      slotId: bookings.slotId,
      count: sql<number>`coalesce(sum(${bookings.quantity}), 0)::int`,
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
export async function slotGroupsMap(slotIds: string[]): Promise<Map<string, string[]>> {
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

/**
 * Dates that contain at least one genuinely bookable slot in a range.
 * Uses the same booking_slots rows, capacity accounting and group links as
 * the dashboard slot list, but returns only distinct date keys for the
 * public booking calendar.
 */
export async function availableSlotDates(
  from: string,
  to: string,
  groupId?: string,
  shared?: { groupIds: string[]; quantity: number },
): Promise<string[]> {
  const selected = shared ? [...new Set(shared.groupIds)] : [];
  if (shared && (selected.length === 0 || shared.quantity < 1)) return [];

  const rows = await listSlots({
    from,
    to,
    groupId: shared ? undefined : groupId,
  });

  const dates = new Set<string>();
  for (const slot of rows) {
    if (!slot.available) continue;
    if (
      shared &&
      (
        slot.capacity - slot.bookedCount < shared.quantity ||
        (slot.groupIds.length > 0 && !selected.every((id) => slot.groupIds.includes(id)))
      )
    ) continue;
    dates.add(slot.slotDate);
  }
  return [...dates].sort();
}

