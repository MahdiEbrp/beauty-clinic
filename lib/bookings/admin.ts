import "server-only";

import { and, eq, inArray, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/src/db";
import { bookings, bookingStatusEnum, type BookingStatus } from "@/src/db/schema";

export type BookingFilters = {
  search?: string;
  status?: "all" | BookingStatus;
};

/** Builds the same search conditions as `listBookings` in service.ts. */
function bookingConditions(opts: BookingFilters): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(bookings.status, opts.status));
  }
  if (opts.search?.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        sql`${bookings.fullName} ILIKE ${term}`,
        sql`${bookings.phone} ILIKE ${term}`,
        sql`${bookings.groupTitle} ILIKE ${term}`,
        sql`${bookings.email} ILIKE ${term}`,
      ),
    );
  }
  return conditions;
}

/** Returns the booking ids matching the given filters (used for bulk actions). */
export async function findBookingIds(opts: BookingFilters): Promise<string[]> {
  const where = and(...bookingConditions(opts));
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(where);
  return rows.map((row) => row.id);
}

/** Bumps a set of bookings to a single status (bulk confirm/cancel). */
export async function setBookingsStatus(
  ids: string[],
  status: BookingStatus,
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(inArray(bookings.id, ids));
}

/** Deletes a set of bookings in one query (bulk delete). */
export async function deleteBookings(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(bookings).where(inArray(bookings.id, ids));
}

export { bookingStatusEnum };

export type { BookingStatus };