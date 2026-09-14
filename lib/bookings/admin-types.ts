import type { Booking, BookingStatus } from "@/src/db/schema";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";

export type { BookingStatus, SlotAdminRow };

export interface ReservationAdmin {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  groupId: string | null;
  groupTitle: string;
  totalAmount: number;
  currency: string;
  slotStart: string | null;
  status: BookingStatus;
  paymentReference: string | null;
  createdAt: string;
  notes: string | null;
}

/** Normalize a raw booking row for JSON-safe transport (client fetch + RSC props). */
export function toReservationAdmin(row: Booking): ReservationAdmin {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email ?? null,
    groupId: row.groupId ?? null,
    groupTitle: row.groupTitle,
    totalAmount: Number(row.totalAmount ?? 0),
    currency: row.currency,
    slotStart: row.slotStart ? new Date(row.slotStart).toISOString() : null,
    status: row.status,
    paymentReference: row.paymentReference ?? null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    notes: row.notes ?? null,
  };
}

export function mapReservations(rows: Booking[]): ReservationAdmin[] {
  return rows.map(toReservationAdmin);
}
