import { and, desc, eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { bookings, type BookingStatus } from "@/src/db/schema";

import { toMoney, type BookingSummary } from "./service";

export type BookingGroupSummary = {
  groupRef: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: BookingStatus;
  paymentReference: string | null;
  consultationRequired: boolean;
  createdAt: Date;
  canCancelUntil: string | null;
  items: {
    id: string;
    groupTitle: string;
    quantity: number;
    slotDate: string | null;
    startTime: string | null;
    endTime: string | null;
    totalAmount: string;
  }[];
};

function hhmm(date: Date): string {
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

function groupItem(row: BookingSummary) {
  return {
    id: row.id,
    groupTitle: row.groupTitle,
    quantity: row.quantity,
    slotDate: row.slotStart ? row.slotStart.toISOString().slice(0, 10) : null,
    startTime: row.slotStart ? hhmm(row.slotStart) : null,
    endTime: row.slotEnd ? hhmm(row.slotEnd) : null,
    totalAmount: row.totalAmount,
  };
}

function cancelDeadline(createdAt: Date, minCancelHours: number): string | null {
  if (minCancelHours <= 0) return null;
  return new Date(createdAt.getTime() + minCancelHours * 60 * 60 * 1000).toISOString();
}

/** The clinic's cancellation window in hours (0 = cancellation always allowed). */
export async function loadMinCancelHours(): Promise<number> {
  const settings = await loadSystemSettingsMap();
  return toMoney(settings.get("booking.min_cancel_hours"));
}

const isTerminal = (row: BookingSummary) =>
  row.status === "done" || row.status === "refunded";

/** Earliest slot start across a group's rows, or null when none has a slot. */
export function earliestSlotStart(rows: readonly { slotStart: Date | null }[]): Date | null {
  const first = rows
    .map((row) => row.slotStart?.getTime())
    .filter((t): t is number => typeof t === "number")
    .sort((a, b) => a - b)[0];
  return typeof first === "number" ? new Date(first) : null;
}

/**
 * Public "my bookings" feed: all groups for a phone number, newest first.
 * One query, grouped in memory (no N+1).
 */
export async function listBookingGroupsByPhone(phone: string): Promise<BookingGroupSummary[]> {
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.phone, phone))
    .orderBy(desc(bookings.createdAt));

  const minCancelHours = await loadMinCancelHours();

  const groups = new Map<string, BookingGroupSummary>();
  for (const row of rows) {
    const existing = groups.get(row.groupRef);
    if (existing) {
      existing.items.push(groupItem(row));
      continue;
    }
    groups.set(row.groupRef, {
      groupRef: row.groupRef,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
      status: row.status,
      paymentReference: row.paymentReference,
      consultationRequired: row.consultationRequired,
      createdAt: row.createdAt,
      canCancelUntil: cancelDeadline(row.createdAt, minCancelHours),
      items: [groupItem(row)],
    });
  }
  return [...groups.values()];
}

/**
 * Cancels every non-finished row of a booking group after verifying the
 * `booking.min_cancel_hours` policy against the earliest slot start.
 * Paid/waiting rows → refunded; unpaid (pending) rows are deleted, freeing
 * their slots.
 */
export async function cancelBookingGroup(
  groupRef: string,
  phone: string,
): Promise<{ cancelled: number }> {
  const rows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.groupRef, groupRef), eq(bookings.phone, phone)));

  return cancelBookingRows(rows);
}

/**
 * Cancels the given (already ownership-checked) rows of one group, applying
 * the same policy as `cancelBookingGroup`. Shared by the public phone-based
 * lookup and the signed-in customer panel.
 */
export async function cancelBookingRows(
  rows: BookingSummary[],
): Promise<{ cancelled: number }> {
  if (rows.length === 0) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  if (rows.every(isTerminal)) return { cancelled: 0 };

  const minCancelHours = await loadMinCancelHours();
  const firstStart = earliestSlotStart(rows);

  if (firstStart && minCancelHours > 0) {
    const hoursLeft = (firstStart.getTime() - Date.now()) / (60 * 60 * 1000);
    if (hoursLeft < minCancelHours) {
      throw new ApiError(
        409,
        "CANCEL_WINDOW_PASSED",
        `Bookings can only be cancelled at least ${minCancelHours} hours before the appointment.`,
      );
    }
  }

  const pendingIds = rows
    .filter((row) => row.status === "pending")
    .map((row) => row.id);
  const refundIds = rows
    .filter((row) => !isTerminal(row) && row.status !== "pending")
    .map((row) => row.id);

  if (refundIds.length > 0) {
    await db
      .update(bookings)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(inArray(bookings.id, refundIds));
  }
  if (pendingIds.length > 0) {
    await db.delete(bookings).where(inArray(bookings.id, pendingIds));
  }
  return { cancelled: pendingIds.length + refundIds.length };
}