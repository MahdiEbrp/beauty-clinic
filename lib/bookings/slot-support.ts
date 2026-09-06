import "server-only";

import { eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookingSlotServices, bookingSlots } from "@/src/db/schema";

export type SlotRow = typeof bookingSlots.$inferSelect;

/**
 * The (slot_date, start_time) unique index makes duplicates impossible; this
 * returns the set of existing "date|start_time" keys covering the given input
 * so callers can skip duplicates in one batched query.
 */
export async function existingSlotKeys(
  input: { slotDate: string; startTime: string }[],
): Promise<Set<string>> {
  const dates = [...new Set(input.map((item) => item.slotDate))];
  if (dates.length === 0) return new Set();
  const rows = await db
    .select({ slotDate: bookingSlots.slotDate, startTime: bookingSlots.startTime })
    .from(bookingSlots)
    .where(inArray(bookingSlots.slotDate, dates));
  return new Set(rows.map((row) => `${row.slotDate}|${row.startTime}`));
}

export async function requireSlot(id: string): Promise<SlotRow> {
  const [row] = await db
    .select()
    .from(bookingSlots)
    .where(eq(bookingSlots.id, id))
    .limit(1);
  if (!row) throw new ApiError(404, "SLOT_NOT_FOUND", "Slot not found.");
  return row;
}

/** Replaces the slot ↔ service links wholesale (delete + insert). */
export async function replaceSlotServices(
  slotId: string,
  serviceIds: string[],
) {
  await db.delete(bookingSlotServices).where(eq(bookingSlotServices.slotId, slotId));
  if (serviceIds.length > 0) {
    await db.insert(bookingSlotServices).values(
      serviceIds.map((serviceId) => ({ slotId, serviceId })),
    );
  }
}