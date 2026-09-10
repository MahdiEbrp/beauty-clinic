import type { SlotStatus } from "@/lib/bookings/slot-status";
import type { BookingStatus } from "@/src/db/schema";

export const RESERVE_STATUS_CLASS: Record<BookingStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  paid: "bg-copper/10 text-copper-strong border-copper/30",
  waiting: "bg-gold/10 text-gold border-gold/30",
  done: "bg-success/10 text-success border-success/30",
  refunded: "bg-surface-tertiary text-content-secondary border-border-primary",
};

/** Fallback used for unknown statuses so a pill never crashes. */
export const RESERVE_STATUS_FALLBACK_CLASS = RESERVE_STATUS_CLASS.refunded;

export const SLOT_STATUS_CLASS: Record<SlotStatus, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
  expired: "bg-error/10 text-error border-error/30",
};