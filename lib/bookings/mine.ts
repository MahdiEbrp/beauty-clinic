import "server-only";

import { and, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookings, users, type BookingStatus } from "@/src/db/schema";

import type { MyReservationAdmin } from "./admin-types";
import type { BookingSummary } from "./create";
import { aggregateBookingGroup } from "./grouping";
import { cancelBookingRows, earliestSlotStart, loadMinCancelHours } from "./groups";

/** Statuses the customer can still cancel; finished rows are locked. */
const CANCELLABLE_STATUSES: readonly BookingStatus[] = ["pending", "paid", "waiting"];

export type BookingOwner = {
  userId: string;
  /** Last 10 digits of the account phone — matches orders placed before signup. */
  phoneDigits: string | null;
};

export type MyBookingsQuery = {
  page: number;
  perPage: number;
  search?: string;
  status: "all" | BookingStatus;
};

export type MyBookingsPage = {
  items: MyReservationAdmin[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** Resolves the signed-in user's own-booking scope. */
export async function loadBookingOwner(userId: string): Promise<BookingOwner> {
  const [row] = await db
    .select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const digits = row?.phone?.replace(/\D/g, "") ?? "";
  return { userId, phoneDigits: digits.length >= 10 ? digits.slice(-10) : null };
}

function phoneTail(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

/**
 * Ownership test: the row was linked to this account at booking time, or the
 * phone it was booked with matches the account (pre-signup orders).
 */
function isOwned(row: BookingSummary, owner: BookingOwner): boolean {
  if (row.customerId === owner.userId) return true;
  return owner.phoneDigits !== null && phoneTail(row.phone) === owner.phoneDigits;
}

/**
 * The caller's own rows: indexed `customer_id` branch plus a digit-normalized
 * phone branch, because bookings store the phone exactly as it was typed.
 */
function ownerScope(owner: BookingOwner): SQL {
  const branches: SQL[] = [eq(bookings.customerId, owner.userId)];
  if (owner.phoneDigits) {
    branches.push(
      sql`right(regexp_replace(${bookings.phone}, '[^0-9]', '', 'g'), 10) = ${owner.phoneDigits}`,
    );
  }
  return or(...branches) ?? branches[0];
}

/**
 * Cancellation deadline for an order: its earliest slot start minus the
 * clinic's window. An order without a slot has no fixed deadline.
 */
function cancelDeadline(slotStart: Date | null, minCancelHours: number): Date | null {
  if (!slotStart || minCancelHours <= 0) return null;
  return new Date(slotStart.getTime() - minCancelHours * 60 * 60 * 1000);
}

function toMyReservation(
  rows: readonly BookingSummary[],
  minCancelHours: number,
  preferredStatus?: BookingStatus,
): MyReservationAdmin {
  const aggregated = aggregateBookingGroup(rows, preferredStatus);
  const deadline = cancelDeadline(earliestSlotStart(rows), minCancelHours);
  const cancellable =
    CANCELLABLE_STATUSES.includes(aggregated.status) &&
    (deadline === null || deadline.getTime() > Date.now());
  return {
    ...aggregated,
    canCancel: cancellable,
    cancelUntil: deadline ? deadline.toISOString() : null,
  };
}

/**
 * The caller's own reservations, newest first, grouped by `groupRef` so each
 * booking order renders as a single row with the combined services and deposit.
 */
export async function listMyBookings(
  owner: BookingOwner,
  query: MyBookingsQuery,
): Promise<MyBookingsPage> {
  const conditions: SQL[] = [ownerScope(owner)];
  if (query.status !== "all") conditions.push(eq(bookings.status, query.status));
  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    conditions.push(
      or(
        sql`${bookings.groupRef} ILIKE ${term}`,
        sql`${bookings.groupTitle} ILIKE ${term}`,
      ) as SQL,
    );
  }
  const where = and(...conditions);

  const [countRow] = await db
    .select({ count: sql<number>`count(distinct ${bookings.groupRef})::int` })
    .from(bookings)
    .where(where);
  const total = Number(countRow?.count ?? 0);

  if (total === 0) {
    return {
      items: [],
      total: 0,
      page: query.page,
      perPage: query.perPage,
      totalPages: 0,
    };
  }

  const pageRefs = await db
    .select({ groupRef: bookings.groupRef })
    .from(bookings)
    .where(where)
    .groupBy(bookings.groupRef)
    .orderBy(desc(sql`max(${bookings.createdAt})`), desc(bookings.groupRef))
    .limit(query.perPage)
    .offset((query.page - 1) * query.perPage);

  const refs = pageRefs.map((row) => row.groupRef);
  if (refs.length === 0) {
    return {
      items: [],
      total,
      page: query.page,
      perPage: query.perPage,
      totalPages: Math.ceil(total / query.perPage),
    };
  }

  const rows = await db
    .select()
    .from(bookings)
    .where(and(ownerScope(owner), inArray(bookings.groupRef, refs)));

  const minCancelHours = await loadMinCancelHours();
  const preferredStatus = query.status !== "all" ? query.status : undefined;

  const byRef = new Map<string, BookingSummary[]>();
  for (const row of rows) {
    const list = byRef.get(row.groupRef);
    if (list) list.push(row);
    else byRef.set(row.groupRef, [row]);
  }

  const items: MyReservationAdmin[] = [];
  for (const ref of refs) {
    const groupRows = byRef.get(ref);
    if (groupRows && groupRows.length > 0) {
      items.push(toMyReservation(groupRows, minCancelHours, preferredStatus));
    }
  }

  return {
    items,
    total,
    page: query.page,
    perPage: query.perPage,
    totalPages: Math.ceil(total / query.perPage),
  };
}

/**
 * Cancels the caller's entire booking order (`groupRef`) identified by any
 * member booking id. Ownership is checked before anything else; a foreign id
 * is reported as missing so booking ids of other customers can't be probed.
 */
export async function cancelMyBooking(
  owner: BookingOwner,
  bookingId: string,
): Promise<{ cancelled: number }> {
  const [target] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!target || !isOwned(target, owner)) {
    throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  }

  const groupRows = await db
    .select()
    .from(bookings)
    .where(and(ownerScope(owner), eq(bookings.groupRef, target.groupRef)));

  return cancelBookingRows(groupRows);
}
