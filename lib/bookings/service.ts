import { and, desc, eq, gte, lte, ne, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import {
  bookings,
  bookingStatusEnum,
  services,
  servicesI18n,
  type BookingStatus,
} from "@/src/db/schema";
import type { Locale } from "@/lib/services/types";
import { isOpenAt } from "./availability";
import { MAX_ADVANCE_DAYS } from "./errors";
import { getSlot } from "./slots";

export function toMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function toLocalTimestamp(date: string, time: string): Date {
  // `date` = YYYY-MM-DD, `time` = HH:MM:SS → local "YYYY-MM-DDTHH:MM:SS".
  return new Date(`${date}T${time}`);
}

type ServiceSnapshot = {
  title: string;
  price: number;
  currency: string;
  durationMin: number | null;
  sessionsCount: number;
};

async function snapshotService(serviceId: string, locale: Locale): Promise<ServiceSnapshot> {
  const settings = await loadSystemSettingsMap();
  const currency = (settings.get("booking.currency") as string) ?? "تومان";

  const [row] = await db
    .select({
      title: servicesI18n.title,
      price: services.price,
      durationMin: services.durationMin,
      sessionsCount: services.sessionsCount,
      isActive: services.isActive,
      locale: servicesI18n.locale,
    })
    .from(services)
    .innerJoin(
      servicesI18n,
      and(eq(servicesI18n.serviceId, services.id), eq(servicesI18n.locale, locale)),
    )
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!row) throw new ApiError(404, "BOOKING_NOT_FOUND", "Service not found.");
  if (!row.isActive) {
    throw new ApiError(409, "SERVICE_UNAVAILABLE", "This service is not available for booking.");
  }

  return {
    title: row.title,
    price: toMoney(row.price),
    currency,
    durationMin: row.durationMin,
    sessionsCount: row.sessionsCount,
  };
}

export type BookingSummary = typeof bookings.$inferSelect;

export async function createBooking(input: {
  fullName: string;
  phone: string;
  email?: string | null;
  serviceId: string;
  slotId: string;
  notes?: string | null;
  locale: Locale;
}) {
  const settings = await loadSystemSettingsMap();
  const slot = await getSlot(input.slotId);
  if (!slot.isActive) {
    throw new ApiError(409, "SLOT_UNAVAILABLE", "This slot is no longer available.");
  }
  if (slot.bookedCount >= slot.capacity) {
    throw new ApiError(409, "SLOT_FULL", "This time slot has just been taken.");
  }
  if (slot.serviceId && slot.serviceId !== input.serviceId) {
    throw new ApiError(409, "SERVICE_UNAVAILABLE", "This slot does not offer the selected service.");
  }

  const slotStart = toLocalTimestamp(slot.slotDate, slot.startTime);
  const slotEnd = toLocalTimestamp(slot.slotDate, slot.endTime);
  const now = Date.now();
  if (slotStart.getTime() <= now) {
    throw new ApiError(400, "PAST_SLOT", "This time slot has already passed.");
  }
  if (slotStart.getTime() > now + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000) {
    throw new ApiError(400, "TOO_FAR_AHEAD", "This date is too far in advance to book.");
  }
  if (!isOpenAt(slotStart, slotEnd, settings.get("clinic.opening_hours"))) {
    throw new ApiError(409, "BUSINESS_CLOSED", "The clinic is closed at the selected time.");
  }

  const service = await snapshotService(input.serviceId, input.locale);
  const deposit = toMoney(settings.get("booking.price"));

  // Reject overlapping, non-cancelled bookings for the same customer.
  const [conflict] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.phone, input.phone),
        ne(bookings.status, "cancelled"),
        lte(bookings.slotStart, slotEnd),
        gte(bookings.slotEnd, slotStart),
      ),
    )
    .limit(1);
  if (conflict) {
    throw new ApiError(409, "CUSTOMER_CONFLICT", "You already have a booking at this time.");
  }

  const [row] = await db
    .insert(bookings)
    .values({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      serviceId: input.serviceId,
      serviceTitle: service.title,
      servicePrice: String(service.price),
      currency: service.currency,
      durationMin: service.durationMin,
      sessionsCount: service.sessionsCount,
      slotId: input.slotId,
      slotStart,
      slotEnd,
      totalAmount: String(deposit),
      status: "pending",
      notes: input.notes ?? null,
    })
    .returning();

  return row;
}

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

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingSummary> {
  const [row] = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();
  if (!row) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  return row;
}

/**
 * Idempotent mock payment: charges `totalAmount` and marks the booking paid.
 * A second call with the same booking returns the existing reference.
 */
export async function recordMockPayment(id: string): Promise<BookingSummary> {
  const [row] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!row) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

  if (row.status === "paid" && row.paymentReference) {
    return row;
  }
  if (row.status === "cancelled") {
    throw new ApiError(409, "BOOKING_CANCELLED", "A cancelled booking cannot be paid.");
  }

  const reference = crypto.randomUUID();
  const [updated] = await db
    .update(bookings)
    .set({ status: "paid", paymentReference: reference, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();
  return updated;
}

export const BOOKING_STATUSES = bookingStatusEnum.enumValues;
