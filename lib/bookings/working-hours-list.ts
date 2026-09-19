import "server-only";

import { and, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { countPatternsByDays } from "./slot-patterns-admin";
import { db } from "@/src/db";
import { workingHours } from "@/src/db/schema";

export type WorkingHoursFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

function workingHoursConditions(opts: WorkingHoursFilters): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(workingHours.isActive, opts.status === "active"));
  }
  if (opts.search?.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        ilike(workingHours.day, term),
        ilike(workingHours.opens, term),
        ilike(workingHours.closes, term),
      ),
    );
  }
  return conditions;
}

export type WorkingHoursAdminRow = {
  id: string;
  day: string;
  opens: string;
  closes: string;
  capacity: number;
  displayOrder: number;
  isActive: boolean;
};

export function toRow(row: typeof workingHours.$inferSelect): WorkingHoursAdminRow {
  return {
    id: row.id,
    day: row.day,
    opens: row.opens.slice(0, 5),
    closes: row.closes.slice(0, 5),
    capacity: row.capacity,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
  };
}

/** A list row plus the number of explicit slot-pattern rows for its day. */
export type WorkingHoursListRow = WorkingHoursAdminRow & { slotCount: number };

export type WorkingHoursListResult = {
  items: WorkingHoursListRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** Paginated, filterable working-hours list for the admin dashboard. */
export async function listWorkingHoursAdmin(query: {
  page: number;
  perPage: number;
  search?: string;
  status?: WorkingHoursFilters["status"];
}): Promise<WorkingHoursListResult> {
  const offset = (query.page - 1) * query.perPage;
  const where = and(...workingHoursConditions(query));

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workingHours)
    .where(where);
  const total = Number(countRow?.count ?? 0);

  const rows = await db
    .select()
    .from(workingHours)
    .where(where)
    .orderBy(asc(workingHours.displayOrder), asc(workingHours.day))
    .limit(query.perPage)
    .offset(offset);

  // One batched lookup for the whole page (never a per-row query).
  const slotCounts = await countPatternsByDays(rows.map((row) => row.day));

  return {
    items: rows.map((row) => ({
      ...toRow(row),
      slotCount: slotCounts.get(row.day) ?? 0,
    })),
    total,
    page: query.page,
    perPage: query.perPage,
    totalPages: Math.ceil(total / query.perPage),
  };
}

/** Returns the working-hours ids matching the given filters (bulk actions). */
export async function findWorkingHourIds(
  opts: WorkingHoursFilters,
): Promise<string[]> {
  const where = and(...workingHoursConditions(opts));
  const rows = await db
    .select({ id: workingHours.id })
    .from(workingHours)
    .where(where);
  return rows.map((row) => row.id);
}
