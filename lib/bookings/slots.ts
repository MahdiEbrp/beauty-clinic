import { and, eq, gte, inArray, lte, ne, or, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookings, bookingSlots } from "@/src/db/schema";

export type SlotSummary = {
  id: string;
  serviceId: string | null;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  bookedCount: number;
  available: boolean;
};

type SlotRow = typeof bookingSlots.$inferSelect;

function toSummary(row: SlotRow, bookedCount: number): SlotSummary {
  const capacity = row.capacity;
  return {
    id: row.id,
    serviceId: row.serviceId,
    slotDate: row.slotDate,
    startTime: row.startTime,
    endTime: row.endTime,
    capacity,
    isActive: row.isActive,
    bookedCount,
    available: row.isActive && bookedCount < capacity,
  };
}

/** Active (non-cancelled) booking counts per slot, batch-aggregated. */
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
        ne(bookings.status, "cancelled"),
        sql`${bookings.slotId} IS NOT NULL`,
      ),
    )
    .groupBy(bookings.slotId);

  for (const row of rows) {
    if (row.slotId) map.set(row.slotId, Number(row.count));
  }
  return map;
}

export async function listSlots(opts: {
  from?: string;
  to?: string;
  serviceId?: string;
}): Promise<SlotSummary[]> {
  const conditions = [];
  if (opts.from) conditions.push(gte(bookingSlots.slotDate, opts.from));
  if (opts.to) conditions.push(lte(bookingSlots.slotDate, opts.to));
  if (opts.serviceId) {
    // Include slots explicitly tied to the service and "any service" slots.
    conditions.push(
      or(
        eq(bookingSlots.serviceId, opts.serviceId),
        sql`${bookingSlots.serviceId} IS NULL`,
      ),
    );
  }

  const rows = await db
    .select()
    .from(bookingSlots)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(bookingSlots.slotDate, bookingSlots.startTime);

  const counts = await bookedCounts(rows.map((r) => r.id));
  return rows.map((row) => toSummary(row, counts.get(row.id) ?? 0));
}

export async function listSlotsByDate(
  slotDate: string,
  serviceId?: string,
): Promise<SlotSummary[]> {
  return listSlots({ from: slotDate, to: slotDate, serviceId });
}

/** Only slots that can still accept a booking today. */
export async function availableSlots(
  slotDate: string,
  serviceId?: string,
): Promise<SlotSummary[]> {
  const rows = await listSlots({ from: slotDate, to: slotDate, serviceId });
  return rows.filter((s) => s.available);
}

export async function createSlots(
  input: {
    serviceId?: string | null;
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }[],
  createdBy?: string,
): Promise<SlotSummary[]> {
  const rows = await db
    .insert(bookingSlots)
    .values(
      input.map((i) => ({
        serviceId: i.serviceId ?? null,
        slotDate: i.slotDate,
        startTime: i.startTime,
        endTime: i.endTime,
        capacity: i.capacity,
        createdBy: createdBy ?? null,
      })),
    )
    .returning();
  const counts = await bookedCounts(rows.map((r) => r.id));
  return rows.map((row) => toSummary(row, counts.get(row.id) ?? 0));
}

export async function getSlot(id: string): Promise<SlotSummary> {
  const [row] = await db
    .select()
    .from(bookingSlots)
    .where(eq(bookingSlots.id, id))
    .limit(1);
  if (!row) throw new ApiError(404, "SLOT_NOT_FOUND", "Slot not found.");
  const count = await bookedCounts([row.id]);
  return toSummary(row, count.get(row.id) ?? 0);
}

export async function updateSlot(
  id: string,
  patch: {
    slotDate?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    isActive?: boolean;
  },
): Promise<SlotSummary> {
  const [existing] = await db
    .select()
    .from(bookingSlots)
    .where(eq(bookingSlots.id, id))
    .limit(1);
  if (!existing) throw new ApiError(404, "SLOT_NOT_FOUND", "Slot not found.");

  const nextEnd = patch.endTime ?? existing.endTime;
  const nextStart = patch.startTime ?? existing.startTime;
  if (nextEnd <= nextStart) {
    throw new ApiError(400, "INVALID_SLOT_TIME", "End time must be after start time.");
  }

  const [row] = await db
    .update(bookingSlots)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(bookingSlots.id, id))
    .returning();
  const count = await bookedCounts([row.id]);
  return toSummary(row, count.get(row.id) ?? 0);
}

export async function deleteSlot(id: string): Promise<void> {
  const [exists] = await db
    .select({ id: bookingSlots.id })
    .from(bookingSlots)
    .where(eq(bookingSlots.id, id))
    .limit(1);
  if (!exists) throw new ApiError(404, "SLOT_NOT_FOUND", "Slot not found.");

  const [ref] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.slotId, id))
    .limit(1);
  if (ref) {
    throw new ApiError(
      409,
      "SLOT_HAS_BOOKINGS",
      "This slot has bookings and cannot be deleted. Deactivate it instead.",
    );
  }

  await db.delete(bookingSlots).where(eq(bookingSlots.id, id));
}
