import "server-only";

import { and, inArray, ne } from "drizzle-orm";

import { db } from "@/src/db";
import { bookings, bookingStatusEnum, type BookingStatus } from "@/src/db/schema";

import { bookingSearchFilter } from "./grouping";

export type BookingFilters = {
  search?: string;
  status?: "all" | BookingStatus;
};

/** Returns the distinct groupRefs matching the given filters (used for bulk actions). */
export async function findBookingGroupRefs(opts: BookingFilters): Promise<string[]> {
  const where = bookingSearchFilter(opts);
  const rows = await db
    .selectDistinct({ groupRef: bookings.groupRef })
    .from(bookings)
    .where(where);
  return rows.map((row) => row.groupRef);
}

/** Resolves distinct groupRefs belonging to the given representative booking ids. */
export async function resolveBookingGroupRefs(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .selectDistinct({ groupRef: bookings.groupRef })
    .from(bookings)
    .where(inArray(bookings.id, ids));
  return rows.map((row) => row.groupRef);
}

/** Returns all booking ids matching the given filters (resolving full groups). */
export async function findBookingIds(opts: BookingFilters): Promise<string[]> {
  const groupRefs = await findBookingGroupRefs(opts);
  if (groupRefs.length === 0) return [];
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(inArray(bookings.groupRef, groupRefs));
  return rows.map((row) => row.id);
}

/** Bumps whole booking groups (`groupRef`) to a single status. */
export async function setBookingGroupsStatus(
  groupRefs: string[],
  status: BookingStatus,
): Promise<void> {
  if (groupRefs.length === 0) return;
  const where =
    status === "refunded"
      ? inArray(bookings.groupRef, groupRefs)
      : and(inArray(bookings.groupRef, groupRefs), ne(bookings.status, "refunded"));
  await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(where);
}

/** Deletes whole booking groups (`groupRef`) in one query. */
export async function deleteBookingGroups(groupRefs: string[]): Promise<void> {
  if (groupRefs.length === 0) return;
  await db.delete(bookings).where(inArray(bookings.groupRef, groupRefs));
}

/** Bumps a set of bookings (and their sibling lines in the same groupRef) to a single status. */
export async function setBookingsStatus(
  ids: string[],
  status: BookingStatus,
): Promise<void> {
  const groupRefs = await resolveBookingGroupRefs(ids);
  await setBookingGroupsStatus(groupRefs, status);
}

/** Deletes a set of bookings (and their sibling lines in the same groupRef). */
export async function deleteBookings(ids: string[]): Promise<void> {
  const groupRefs = await resolveBookingGroupRefs(ids);
  await deleteBookingGroups(groupRefs);
}

export { bookingStatusEnum };

export type { BookingStatus };
