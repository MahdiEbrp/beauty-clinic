import { and, eq, gte, inArray, lte, ne, notInArray, or, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookingSlotServices, bookings, bookingSlots } from "@/src/db/schema";
import { existingSlotKeys, requireSlot, replaceSlotServices } from "./slot-support";
import { computeSlotStatus, type SlotStatus } from "./slot-status";

export type SlotSummary = {
  id: string;
  serviceIds: string[];
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

function toSummary(row: SlotRow, bookedCount: number, serviceIds: string[]): SlotSummary {
  const status = computeSlotStatus(row.isActive, row.slotDate, row.endTime);
  return {
    id: row.id,
    serviceIds,
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

/** Linked service ids per slot, batch-loaded (empty array = all services). */
async function slotServicesMap(slotIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (slotIds.length === 0) return map;

  const rows = await db
    .select({
      slotId: bookingSlotServices.slotId,
      serviceId: bookingSlotServices.serviceId,
    })
    .from(bookingSlotServices)
    .where(inArray(bookingSlotServices.slotId, slotIds));

  for (const row of rows) {
    const list = map.get(row.slotId);
    if (list) list.push(row.serviceId);
    else map.set(row.slotId, [row.serviceId]);
  }
  return map;
}

/**
 * True when a slot accepts every service (`NOT EXISTS` link rows); otherwise
 * it must have an explicit link to the requested service.
 */
function serviceCompatibility(serviceId: string) {
  const noLinks = sql`NOT EXISTS (
    SELECT 1 FROM ${bookingSlotServices} bss WHERE bss.slot_id = ${bookingSlots.id}
  )`;
  const hasLink = sql`EXISTS (
    SELECT 1 FROM ${bookingSlotServices} bss
    WHERE bss.slot_id = ${bookingSlots.id} AND bss.service_id = ${serviceId}
  )`;
  return or(hasLink, noLinks);
}

export async function listSlots(opts: {
  from?: string;
  to?: string;
  serviceId?: string;
}): Promise<SlotSummary[]> {
  const conditions = [];
  if (opts.from) conditions.push(gte(bookingSlots.slotDate, opts.from));
  if (opts.to) conditions.push(lte(bookingSlots.slotDate, opts.to));
  if (opts.serviceId) conditions.push(serviceCompatibility(opts.serviceId));

  const rows = await db
    .select()
    .from(bookingSlots)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(bookingSlots.slotDate, bookingSlots.startTime);

  const [counts, links] = await Promise.all([
    bookedCounts(rows.map((r) => r.id)),
    slotServicesMap(rows.map((r) => r.id)),
  ]);
  return rows.map((row) =>
    toSummary(row, counts.get(row.id) ?? 0, links.get(row.id) ?? []),
  );
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
    serviceIds?: string[];
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
    (item.serviceIds ?? []).map((serviceId) => ({
      slotId: rows[index]?.id,
      serviceId,
    })),
  );
  const validLinks = links.filter((l): l is { slotId: string; serviceId: string } => Boolean(l.slotId));
  if (validLinks.length > 0) await db.insert(bookingSlotServices).values(validLinks);

  const ids = rows.map((r) => r.id);
  const [counts, serviceMap] = await Promise.all([
    bookedCounts(ids),
    slotServicesMap(ids),
  ]);
  return rows.map((row, index) =>
    toSummary(
      row,
      counts.get(row.id) ?? 0,
      serviceMap.get(row.id) ?? toCreate[index]?.serviceIds ?? [],
    ),
  );
}

export async function getSlot(id: string): Promise<SlotSummary> {
  const row = await requireSlot(id);
  const [counts, serviceMap] = await Promise.all([
    bookedCounts([row.id]),
    slotServicesMap([row.id]),
  ]);
  return toSummary(row, counts.get(row.id) ?? 0, serviceMap.get(row.id) ?? []);
}

/** Replaces the slot ↔ service links wholesale (delete + insert). */
export async function updateSlot(
  id: string,
  patch: {
    serviceIds?: string[];
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

  const { serviceIds, ...rest } = patch;
  const [row] = await db
    .update(bookingSlots)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(bookingSlots.id, id))
    .returning();

  if (serviceIds) await replaceSlotServices(id, serviceIds);

  const [counts, serviceMap] = await Promise.all([
    bookedCounts([id]),
    slotServicesMap([id]),
  ]);
  return toSummary(row, counts.get(id) ?? 0, serviceMap.get(id) ?? []);
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
