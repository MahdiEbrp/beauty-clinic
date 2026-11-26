import type { Booking, BookingStatus } from "@/src/db/schema";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";

export type { BookingStatus, SlotAdminRow };

export interface ReservationLineItem {
  id: string;
  groupId: string | null;
  groupTitle: string;
  quantity: number;
  slotStart: string | null;
  slotEnd: string | null;
  status: BookingStatus;
}

export interface ReservationAdmin {
  id: string;
  groupRef: string;
  fullName: string;
  phone: string;
  email: string | null;
  groupId: string | null;
  groupTitle: string;
  totalAmount: number;
  currency: string;
  slotStart: string | null;
  slotEnd: string | null;
  status: BookingStatus;
  paymentReference: string | null;
  createdAt: string;
  notes: string | null;
  itemCount: number;
  items: ReservationLineItem[];
}

/**
 * A booking order as its own customer sees it: the grouped admin shape plus
 * whether it can still be cancelled.
 */
export interface MyReservationAdmin extends ReservationAdmin {
  /** False once the order is finished or its cancellation window has passed. */
  canCancel: boolean;
  /** Last moment this order can be cancelled (null = no fixed deadline). */
  cancelUntil: string | null;
}

/** Normalize a raw booking row for JSON-safe transport (client fetch + RSC props). */
export function toReservationAdmin(row: Booking): ReservationAdmin {
  const slotStart = row.slotStart ? new Date(row.slotStart).toISOString() : null;
  const slotEnd = row.slotEnd ? new Date(row.slotEnd).toISOString() : null;
  return {
    id: row.id,
    groupRef: row.groupRef,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email ?? null,
    groupId: row.groupId ?? null,
    groupTitle: row.groupTitle,
    totalAmount: Number(row.totalAmount ?? 0),
    currency: row.currency,
    slotStart,
    slotEnd,
    status: row.status,
    paymentReference: row.paymentReference ?? null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    notes: row.notes ?? null,
    itemCount: 1,
    items: [
      {
        id: row.id,
        groupId: row.groupId ?? null,
        groupTitle: row.groupTitle,
        quantity: row.quantity,
        slotStart,
        slotEnd,
        status: row.status,
      },
    ],
  };
}

export function mapReservations(rows: Booking[]): ReservationAdmin[] {
  return rows.map(toReservationAdmin);
}
