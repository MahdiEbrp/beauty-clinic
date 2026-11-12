import { logInfo } from "@/lib/log";

/**
 * Slot generation is intentionally NOT automatic — admins generate slots
 * manually on /dashboard/slots by picking a date range. The daily slot
 * auto-generator cron has been removed from here as well.
 */
export function startSlotGenerator(): void {
  // No-op: automatic slot generation has been removed.
  logInfo("slots.generator_disabled", {
    reason: "manual date-range generation on /dashboard/slots",
  });
}
