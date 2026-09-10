import type { BookingStatus } from "@/src/db/schema";

/**
 * Lifecycle: pending (locked) → paid → waiting (for the day) →
 * done (auto when it passes, or admin) / refunded (admin, after payment).
 * Single source of truth for what an admin may set per status.
 */
export const BOOKING_STATUS_FLOW: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ["paid"],
  paid: ["waiting", "done", "refunded"],
  waiting: ["done", "refunded"],
  done: ["refunded"],
  refunded: [],
};

export function nextBookingStatuses(status: BookingStatus): readonly BookingStatus[] {
  return BOOKING_STATUS_FLOW[status] ?? [];
}

/** Statuses that occupy a slot; done/refunded free it again. */
export const SLOT_OCCUPYING_STATUSES: readonly BookingStatus[] = [
  "pending",
  "paid",
  "waiting",
];