import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { bookings, bookingStatusEnum, type BookingStatus } from "@/src/db/schema";

import type { ReservationAdmin } from "./admin-types";
import type { BookingSummary } from "./create";
import {
  aggregateBookingGroup,
  bookingSearchFilter,
  groupBookingRowsInOrder,
} from "./grouping";

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
}): Promise<{
  items: ReservationAdmin[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
  const offset = (query.page - 1) * query.perPage;
  const where = bookingSearchFilter(query);

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
    .offset(offset);

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
    .where(inArray(bookings.groupRef, refs));

  const preferredStatus =
    query.status && query.status !== "all" ? query.status : undefined;

  return {
    items: groupBookingRowsInOrder(refs, rows, preferredStatus),
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

/** Loads the complete grouped order (`groupRef`) addressed by any member id. */
export async function getBookingGroupById(id: string): Promise<ReservationAdmin> {
  const member = await getBooking(id);
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.groupRef, member.groupRef));
  return aggregateBookingGroup(rows);
}

/** Most recent grouped reservations for the dashboard home card (newest first). */
export async function listRecentBookings(limit = 10): Promise<ReservationAdmin[]> {
  const pageRefs = await db
    .select({ groupRef: bookings.groupRef })
    .from(bookings)
    .groupBy(bookings.groupRef)
    .orderBy(desc(sql`max(${bookings.createdAt})`), desc(bookings.groupRef))
    .limit(limit);

  const refs = pageRefs.map((row) => row.groupRef);
  if (refs.length === 0) return [];

  const rows = await db
    .select()
    .from(bookings)
    .where(inArray(bookings.groupRef, refs));

  return groupBookingRowsInOrder(refs, rows);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingSummary> {
  const [current] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!current) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

  const statusWhere =
    status === "refunded" || current.status === "refunded"
      ? eq(bookings.groupRef, current.groupRef)
      : and(eq(bookings.groupRef, current.groupRef), ne(bookings.status, "refunded"));

  const updated = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(statusWhere)
    .returning();
  return updated.find((row) => row.id === id) ?? updated[0] ?? current;
}

/** Admin edit of an existing reservation order (updates all lines sharing `groupRef`). */
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

  const groupRows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.groupRef, current.groupRef));

  const existingRef = groupRows.find((row) => Boolean(row.paymentReference))?.paymentReference;
  const contactSet: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.fullName !== undefined) contactSet.fullName = patch.fullName;
  if (patch.phone !== undefined) contactSet.phone = patch.phone;
  if (patch.email !== undefined) contactSet.email = patch.email ?? null;
  if (patch.notes !== undefined) contactSet.notes = patch.notes ?? null;

  if (patch.status === undefined) {
    const updated = await db
      .update(bookings)
      .set(contactSet)
      .where(eq(bookings.groupRef, current.groupRef))
      .returning();
    return updated.find((row) => row.id === id) ?? updated[0] ?? current;
  }

  const targetIds =
    patch.status === "refunded" || current.status === "refunded"
      ? groupRows.map((row) => row.id)
      : groupRows.filter((row) => row.status !== "refunded").map((row) => row.id);

  // Recording a payment (paid/waiting) without a reference issues one so the
  // payment is traceable even when the admin records it manually.
  const issuedRef =
    (patch.status === "paid" || patch.status === "waiting") && !existingRef
      ? crypto.randomUUID()
      : undefined;

  if (targetIds.length === groupRows.length) {
    const set: Record<string, unknown> = { ...contactSet, status: patch.status };
    if (issuedRef) set.paymentReference = issuedRef;
    const updated = await db
      .update(bookings)
      .set(set)
      .where(eq(bookings.groupRef, current.groupRef))
      .returning();
    return updated.find((row) => row.id === id) ?? updated[0] ?? current;
  }

  // Legacy partially-refunded group: sync contact fields on all rows, status on active lines.
  if (Object.keys(contactSet).length > 1) {
    await db
      .update(bookings)
      .set(contactSet)
      .where(eq(bookings.groupRef, current.groupRef));
  }
  const statusSet: Record<string, unknown> = { status: patch.status, updatedAt: new Date() };
  if (issuedRef) statusSet.paymentReference = issuedRef;
  const updated =
    targetIds.length > 0
      ? await db.update(bookings).set(statusSet).where(inArray(bookings.id, targetIds)).returning()
      : [];
  return updated.find((row) => row.id === id) ?? updated[0] ?? current;
}

/** Admin hard-delete of a booking order (removes all lines sharing `groupRef`). */
export async function deleteBooking(id: string): Promise<void> {
  const [exists] = await db
    .select({ id: bookings.id, groupRef: bookings.groupRef })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  if (!exists) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  await db.delete(bookings).where(eq(bookings.groupRef, exists.groupRef));
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
