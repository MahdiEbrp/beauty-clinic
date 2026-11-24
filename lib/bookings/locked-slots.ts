import { and, inArray, notInArray, sql } from "drizzle-orm";
import { ApiError } from "@/lib/api/errors";
import type { db } from "@/src/db";
import { bookings, bookingSlotGroups, bookingSlots } from "@/src/db/schema";
import { MAX_ADVANCE_DAYS } from "./errors";
import { computeSlotStatus } from "./slot-status";

export type BookingTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** All reads use the caller's transaction connection. Lock slots in global ID
 * order, then batch counts and group links (no per-service query fan-out). */
export async function loadLockedSlots(tx: BookingTx, ids: string[], now: number) {
  const rows = await tx.select().from(bookingSlots)
    .where(inArray(bookingSlots.id, ids)).orderBy(bookingSlots.id).for("update");
  if (rows.length !== ids.length) throw new ApiError(404, "SLOT_NOT_FOUND", "Slot not found.");
  const counts = await tx.select({
    slotId: bookings.slotId, seats: sql<number>`coalesce(sum(${bookings.quantity}), 0)::int`,
  }).from(bookings).where(and(inArray(bookings.slotId, ids), notInArray(bookings.status, ["done", "refunded"])))
    .groupBy(bookings.slotId);
  const links = await tx.select({ slotId: bookingSlotGroups.slotId, groupId: bookingSlotGroups.groupId })
    .from(bookingSlotGroups).where(inArray(bookingSlotGroups.slotId, ids));
  const used = new Map(counts.map((row) => [row.slotId, Number(row.seats)]));
  const groups = new Map<string, string[]>();
  for (const link of links) groups.set(link.slotId, [...(groups.get(link.slotId) ?? []), link.groupId]);
  return new Map(rows.map((row) => {
    if (computeSlotStatus(row.isActive, row.slotDate, row.endTime, new Date(now)) !== "active") {
      throw new ApiError(409, "SLOT_UNAVAILABLE", "This slot is no longer available.");
    }
    const start = new Date(`${row.slotDate}T${row.startTime}`).getTime();
    if (start <= now) throw new ApiError(400, "PAST_SLOT", "This time slot has already passed.");
    if (start > now + MAX_ADVANCE_DAYS * 86_400_000) {
      throw new ApiError(400, "TOO_FAR_AHEAD", "This date is too far in advance to book.");
    }
    return [row.id, {
      date: row.slotDate, start: row.startTime, end: row.endTime, capacity: row.capacity,
      groupIds: groups.get(row.id) ?? [], used: used.get(row.id) ?? 0,
    }];
  }));
}
