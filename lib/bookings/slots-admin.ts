import "server-only";

import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/src/db";
import { bookings, bookingSlots } from "@/src/db/schema";

export type SlotFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

function slotConditions(opts: SlotFilters): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.status === "active") conditions.push(eq(bookingSlots.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(bookingSlots.isActive, false));
  if (opts.search?.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        sql`${bookingSlots.slotDate}::text ILIKE ${term}`,
        ilike(bookingSlots.startTime, term),
        ilike(bookingSlots.endTime, term),
      ),
    );
  }
  return conditions;
}

/** Returns the slot ids matching the given filters (used for bulk actions). */
export async function findSlotIds(opts: SlotFilters): Promise<string[]> {
  const where = and(...slotConditions(opts));
  const rows = await db
    .select({ id: bookingSlots.id })
    .from(bookingSlots)
    .where(where);
  return rows.map((row) => row.id);
}

/** Sets active/inactive on a set of slots in one query (bulk activate/deactivate). */
export async function setSlotsActive(ids: string[], isActive: boolean): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(bookingSlots)
    .set({ isActive, updatedAt: new Date() })
    .where(inArray(bookingSlots.id, ids));
}

/**
 * Bulk-deletes slots that have no bookings. Returns the ids that were left in
 * place because they still have reservations (mirrors the single `deleteSlot`
 * guard, batched to stay within a couple of queries).
 */
export async function deleteSlots(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const referenced = await db
    .select({ slotId: bookings.slotId })
    .from(bookings)
    .where(
      and(inArray(bookings.slotId, ids), sql`${bookings.slotId} IS NOT NULL`),
    );
  const blocked = new Set(referenced.map((row) => row.slotId));
  const removable = ids.filter((id) => !blocked.has(id));
  if (removable.length > 0) {
    await db.delete(bookingSlots).where(inArray(bookingSlots.id, removable));
  }
  return ids.filter((id) => blocked.has(id));
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
        sql`${bookings.slotId} IS NOT NULL`,
        sql`${bookings.status} <> 'cancelled'`,
      ),
    )
    .groupBy(bookings.slotId);
  for (const row of rows) {
    if (row.slotId) map.set(row.slotId, Number(row.count));
  }
  return map;
}

export type SlotAdminRow = {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  bookedCount: number;
};

export type SlotsListResult = {
  items: SlotAdminRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/**
 * Paginated, filterable slot list for the admin dashboard (separate from the
 * date-range calendar fetch used by the public/admin calendar).
 */
export async function listSlotsAdmin(query: {
  page: number;
  perPage: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}): Promise<SlotsListResult> {
  const offset = (query.page - 1) * query.perPage;
  const where = and(...slotConditions(query));

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingSlots)
    .where(where);
  const total = Number(countRow?.count ?? 0);

  const rows = await db
    .select()
    .from(bookingSlots)
    .where(where)
    .orderBy(desc(bookingSlots.slotDate), bookingSlots.startTime)
    .limit(query.perPage)
    .offset(offset);

  const counts = await bookedCounts(rows.map((row) => row.id));
  const items: SlotAdminRow[] = rows.map((row) => ({
    id: row.id,
    slotDate: row.slotDate,
    startTime: row.startTime,
    endTime: row.endTime,
    capacity: row.capacity,
    isActive: row.isActive,
    bookedCount: counts.get(row.id) ?? 0,
  }));

  return {
    items,
    total,
    page: query.page,
    perPage: query.perPage,
    totalPages: Math.ceil(total / query.perPage),
  };
}