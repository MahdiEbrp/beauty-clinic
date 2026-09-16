import "server-only";

import { and, desc, eq, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookings, users, type BookingStatus } from "@/src/db/schema";

import { toReservationAdmin, type MyReservationAdmin } from "./admin-types";
import type { BookingSummary } from "./create";
import { cancelBookingRows, loadMinCancelHours } from "./groups";

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
 * Cancellation deadline for one line: its own slot start minus the clinic's
 * window. A line without a slot has no fixed deadline.
 */
function cancelDeadline(slotStart: Date | null, minCancelHours: number): Date | null {
  if (!slotStart || minCancelHours <= 0) return null;
  return new Date(slotStart.getTime() - minCancelHours * 60 * 60 * 1000);
}

function toMyReservation(row: BookingSummary, minCancelHours: number): MyReservationAdmin {
  const deadline = cancelDeadline(row.slotStart, minCancelHours);
  const cancellable =
    CANCELLABLE_STATUSES.includes(row.status) &&
    (deadline === null || deadline.getTime() > Date.now());
  return {
    ...toReservationAdmin(row),
    groupRef: row.groupRef,
    canCancel: cancellable,
    cancelUntil: deadline ? deadline.toISOString() : null,
  };
}

/**
 * The caller's own reservations, newest first. Each row is one service line of
 * an order, and each carries its own cancel deadline.
 *
 * Three sequential queries (owner, count, page of rows) — the per-line deadline
 * comes from the row's own slot, so no page ever fans out into per-row queries.
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
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(where);
  const total = Number(countRow?.count ?? 0);

  const items = await db
    .select()
    .from(bookings)
    .where(where)
    .orderBy(desc(bookings.createdAt))
    .limit(query.perPage)
    .offset((query.page - 1) * query.perPage);

  const minCancelHours = await loadMinCancelHours();

  return {
    items: items.map((row) => toMyReservation(row, minCancelHours)),
    total,
    page: query.page,
    perPage: query.perPage,
    totalPages: Math.ceil(total / query.perPage),
  };
}

/**
 * Cancels ONE service line of the caller's own order. Ownership is checked
 * before anything else; a foreign id is reported as missing so booking ids of
 * other customers can't be probed.
 */
export async function cancelMyBooking(
  owner: BookingOwner,
  bookingId: string,
): Promise<{ cancelled: number }> {
  const [target] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!target || !isOwned(target, owner)) {
    throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  }

  // A single row: the shared policy helper enforces the window against this
  // line's own slot start.
  return cancelBookingRows([target]);
}
