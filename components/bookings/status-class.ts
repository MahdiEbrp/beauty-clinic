import type { SlotStatus } from "@/lib/bookings/slot-status";

export const RESERVE_STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  processing: "bg-copper/10 text-copper-strong border-copper/30",
  canceled: "bg-surface-tertiary text-content-secondary border-border-primary",
  refund: "bg-success/10 text-success border-success/30",
};

export const SLOT_STATUS_CLASS: Record<SlotStatus, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
  expired: "bg-error/10 text-error border-error/30",
};
