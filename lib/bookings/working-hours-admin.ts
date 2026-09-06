import "server-only";

import { and, asc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { workingHours } from "@/src/db/schema";
import { bustWorkingHoursCache } from "./working-hours";

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

function toRow(row: typeof workingHours.$inferSelect): WorkingHoursAdminRow {
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

export type WorkingHoursListResult = {
  items: WorkingHoursAdminRow[];
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

  return {
    items: rows.map(toRow),
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

/** Sets active/inactive on a set of working-hours rows in one query. */
export async function setWorkingHoursActive(
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(workingHours)
    .set({ isActive, updatedAt: new Date() })
    .where(inArray(workingHours.id, ids));
  await bustWorkingHoursCache();
}

/** Bulk-deletes working-hours rows (nothing references them). */
export async function deleteWorkingHours(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  await db.delete(workingHours).where(inArray(workingHours.id, ids));
  await bustWorkingHoursCache();
  return [];
}

export async function getWorkingHour(
  id: string,
): Promise<WorkingHoursAdminRow | null> {
  const [row] = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.id, id))
    .limit(1);
  return row ? toRow(row) : null;
}

/** Creates one working-hours row. Day is unique — a second entry for the same
 * weekday is rejected with a clean 409 instead of a unique-violation 500. */
export async function createWorkingHour(
  input: {
    day: string;
    opens: string;
    closes: string;
    capacity: number;
    displayOrder: number;
    isActive: boolean;
  },
): Promise<WorkingHoursAdminRow> {
  const [row] = await db
    .insert(workingHours)
    .values({
      day: input.day,
      opens: input.opens,
      closes: input.closes,
      capacity: input.capacity,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    })
    .onConflictDoNothing({ target: workingHours.day })
    .returning();
  if (!row) {
    throw new ApiError(
      409,
      "DAY_EXISTS",
      "Working hours already exist for this day.",
    );
  }
  await bustWorkingHoursCache();
  return toRow(row);
}

/** Updates a working-hours row. The day itself is immutable. */
export async function updateWorkingHour(
  id: string,
  patch: {
    opens?: string;
    closes?: string;
    capacity?: number;
    displayOrder?: number;
    isActive?: boolean;
  },
): Promise<WorkingHoursAdminRow> {
  const [row] = await db
    .update(workingHours)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(workingHours.id, id))
    .returning();
  if (!row) {
    throw new ApiError(404, "WORKING_HOURS_NOT_FOUND", "Working hours not found.");
  }
  await bustWorkingHoursCache();
  return toRow(row);
}

export async function deleteWorkingHour(id: string): Promise<void> {
  const [row] = await db
    .delete(workingHours)
    .where(eq(workingHours.id, id))
    .returning({ id: workingHours.id });
  if (!row) {
    throw new ApiError(404, "WORKING_HOURS_NOT_FOUND", "Working hours not found.");
  }
  await bustWorkingHoursCache();
}