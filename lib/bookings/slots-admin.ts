import "server-only";

import { and, desc, eq, ilike, inArray, notInArray, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/src/db";
import { bookings, bookingSlots, bookingSlotGroups, serviceGroupsI18n } from "@/src/db/schema";
import {
  computeSlotStatus,
  slotStatusCondition,
  type SlotStatus,
} from "./slot-status";

export type SlotFilters = {
  search?: string;
  status?: "all" | SlotStatus;
  groupId?: string;
};

function slotConditions(opts: SlotFilters): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.status && opts.status !== "all") {
    // Derived-status match (active/inactive/expired) as a raw SQL condition.
    conditions.push(sql.raw(slotStatusCondition(opts.status)));
  }
  if (opts.groupId) {
    const noLinks = sql`NOT EXISTS (
      SELECT 1 FROM ${bookingSlotGroups} bsg WHERE bsg.slot_id = ${bookingSlots.id}
    )`;
    const hasLink = sql`EXISTS (
      SELECT 1 FROM ${bookingSlotGroups} bsg
      WHERE bsg.slot_id = ${bookingSlots.id} AND bsg.group_id = ${opts.groupId}
    )`;
    conditions.push(or(hasLink, noLinks));
  }
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
 * Bulk-deletes slots that have no reservations. Returns the ids that were left
 * in place because they still have bookings (slots with reservations are never
 * hard-deleted; booking `slot_id` references are only nulled for deleted slots,
 * so slots with history are always kept).
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
        sql`${bookings.slotId} IS NOT NULL`,
        notInArray(bookings.status, ["done", "refunded"]),
      ),
    )
    .groupBy(bookings.slotId);
  for (const row of rows) {
    if (row.slotId) map.set(row.slotId, Number(row.count));
  }
  return map;
}

/**
 * Linked group titles per slot (admin display), batch-loaded with one
 * `inArray` join across both locales. Slots without links return an empty
 * list (= all groups).
 */
async function slotGroupsMap(
  slotIds: string[],
): Promise<Map<string, SlotAdminRow["groups"]>> {
  const map = new Map<string, SlotAdminRow["groups"]>();
  if (slotIds.length === 0) return map;

  const rows = await db
    .select({
      slotId: bookingSlotGroups.slotId,
      groupId: bookingSlotGroups.groupId,
      locale: serviceGroupsI18n.locale,
      title: serviceGroupsI18n.name,
    })
    .from(bookingSlotGroups)
    .innerJoin(serviceGroupsI18n, eq(serviceGroupsI18n.groupId, bookingSlotGroups.groupId));

  const byKey = new Map<
    string,
    { slotId: string; id: string; titleFa: string; titleEn: string | null }
  >();
  for (const row of rows) {
    const key = `${row.slotId}:${row.groupId}`;
    const entry = byKey.get(key) ?? {
      slotId: row.slotId,
      id: row.groupId,
      titleFa: "",
      titleEn: null,
    };
    if (row.locale === "en") entry.titleEn = row.title;
    else entry.titleFa = row.title;
    byKey.set(key, entry);
  }
  for (const entry of byKey.values()) {
    const title = entry.titleFa || entry.titleEn || "";
    if (!title) continue;
    const list = map.get(entry.slotId);
    const item = { id: entry.id, title };
    if (list) list.push(item);
    else map.set(entry.slotId, [item]);
  }
  return map;
}

export type SlotAdminRow = {
  id: string;
  groupIds: string[];
  /** Localized linked-group titles; empty when the slot allows all groups. */
  groups: Array<{ id: string; title: string }>;
  allGroups: boolean;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  /** Derived on read: active | inactive | expired. */
  status: SlotStatus;
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
  status?: "all" | SlotStatus;
  groupId?: string;
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

  const ids = rows.map((row) => row.id);
  const [counts, groupMap] = await Promise.all([
    bookedCounts(ids),
    slotGroupsMap(ids),
  ]);

  const items: SlotAdminRow[] = rows.map((row) => {
    const groups = groupMap.get(row.id) ?? [];
    return {
      id: row.id,
      groupIds: groups.map((g) => g.id),
      groups,
      allGroups: groups.length === 0,
      slotDate: row.slotDate,
      startTime: row.startTime,
      endTime: row.endTime,
      capacity: row.capacity,
      isActive: row.isActive,
      status: computeSlotStatus(row.isActive, row.slotDate, row.endTime),
      bookedCount: counts.get(row.id) ?? 0,
    };
  });

  return {
    items,
    total,
    page: query.page,
    perPage: query.perPage,
    totalPages: Math.ceil(total / query.perPage),
  };
}
