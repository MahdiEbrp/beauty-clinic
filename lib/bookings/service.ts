import { and, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookings, bookingStatusEnum, type BookingStatus } from "@/src/db/schema";

import type { BookingSummary } from "./create";

export {
  toMoney,
  toLocalTimestamp,
  createBooking,
  createBookingGroup,
} from "./create";
export type {
  BookingSummary,
  BookingItemInput,
  BookingGroupInput,
} from "./create";
export { listBookingGroupsByPhone, cancelBookingGroup } from "./groups";
export type { BookingGroupSummary } from "./groups";

export async function listBookings(query: {
  page: number;
  perPage: number;
  search?: string;
  status?: "all" | BookingStatus;
  slotId?: string;
}) {
  const offset = (query.page - 1) * query.perPage;
  const conditions: SQL[] = [];

  if (query.slotId) conditions.push(eq(bookings.slotId, query.slotId));
  if (query.status && query.status !== "all") {
    conditions.push(eq(bookings.status, query.status));
  }
  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    conditions.push(
      or(
        sql`${bookings.fullName} ILIKE ${term}`,
        sql`${bookings.phone} ILIKE ${term}`,
        sql`${bookings.serviceTitle} ILIKE ${term}`,
        sql`${bookings.email} ILIKE ${term}`,
      ) as SQL,
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

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
    .offset(offset);

  return {
    items,
    total,
    page: query.page,
    perPage: query.perPage,
    totalPages: Math.ceil(total / query.perPage),
  };
}

export async function getBooking(id: string): Promise<BookingSummary> {
  const [row] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!row) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  return row;
}

/** Most recent reservations for the dashboard home card (newest first). */
export async function listRecentBookings(limit = 10): Promise<BookingSummary[]> {
  return db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingSummary> {
  const [row] = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();
  if (!row) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  return row;
}

/** Admin edit of an existing reservation (customer fields + optional status). */
export async function updateBookingDetails(
  id: string,
  patch: {
    fullName?: string;
    phone?: string;
    email?: string | null;
    notes?: string | null;
    status?: BookingStatus;
  },
): Promise<BookingSummary> {
  const [current] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!current) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.fullName !== undefined) set.fullName = patch.fullName;
  if (patch.phone !== undefined) set.phone = patch.phone;
  if (patch.email !== undefined) set.email = patch.email ?? null;
  if (patch.notes !== undefined) set.notes = patch.notes ?? null;
  if (patch.status !== undefined) set.status = patch.status;
  // Recording a payment (paid/waiting) without a reference issues one so the
  // payment is traceable even when the admin records it manually.
  if (
    (patch.status === "paid" || patch.status === "waiting") &&
    !current.paymentReference
  ) {
    set.paymentReference = crypto.randomUUID();
  }
  const [row] = await db.update(bookings).set(set).where(eq(bookings.id, id)).returning();
  if (!row) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  return row;
}

/** Admin hard-delete of a booking. */
export async function deleteBooking(id: string): Promise<void> {
  const [exists] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  if (!exists) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  await db.delete(bookings).where(eq(bookings.id, id));
}

/**
 * Idempotent mock payment for a whole booking GROUP: marks every pending row
 * in the group paid with a shared reference. Calling again with any member id
 * returns the existing reference. Done/refunded groups cannot be paid.
 */
export async function recordMockPayment(id: string): Promise<BookingSummary> {
  const [member] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!member) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

  const group = await db.select().from(bookings).where(eq(bookings.groupRef, member.groupRef));

  const isTerminal = (row: BookingSummary) =>
    row.status === "done" || row.status === "refunded";
  const paidRow = group.find(
    (row) => row.status === "paid" && row.paymentReference,
  );
  if (paidRow) return paidRow;
  if (group.every(isTerminal)) {
    throw new ApiError(409, "BOOKING_CANCELLED", "A finished booking cannot be paid.");
  }

  const reference = crypto.randomUUID();
  const ids = group.filter((row) => !isTerminal(row)).map((row) => row.id);
  const [updated] = await db
    .update(bookings)
    .set({ status: "paid", paymentReference: reference, updatedAt: new Date() })
    .where(inArray(bookings.id, ids))
    .returning();
  return updated;
}

export const BOOKING_STATUSES = bookingStatusEnum.enumValues;

/** Pays a whole booking group, addressed by any member id or the group ref. */
export async function payBookingGroup(
  ref: { bookingId?: string; groupRef?: string },
): Promise<BookingSummary> {
  let id = ref.bookingId ?? null;
  if (!id && ref.groupRef) {
    const [row] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.groupRef, ref.groupRef))
      .limit(1);
    id = row?.id ?? null;
  }
  if (!id) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  return recordMockPayment(id);
}
