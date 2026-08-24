/**
 * Derived slot status — the single source of truth for active/inactive/expired
 * across API, admin list and public availability. `expired` is never stored;
 * it is computed from the slot's own end datetime versus "now", so no cron or
 * lazy writes are needed.
 */

export type SlotStatus = "active" | "inactive" | "expired";

export const SLOT_STATUSES: SlotStatus[] = ["active", "inactive", "expired"];

/**
 * Pure status computation. `slotDate` = "YYYY-MM-DD", `endTime` = "HH:MM:SS"
 * (clinic-local wall clock, matching how slots are written/read everywhere
 * else). Mirrors the SQL fragments below.
 */
export function computeSlotStatus(
  isActive: boolean,
  slotDate: string,
  endTime: string,
  now: Date = new Date(),
): SlotStatus {
  if (!isActive) return "inactive";
  return new Date(`${slotDate}T${endTime}`).getTime() <= now.getTime()
    ? "expired"
    : "active";
}

/**
 * WHERE fragment matching one derived status. Only ever interpolated with
 * literals from this file ("booking_slots") — never user input.
 * `date + time` yields a timestamp compared against now(); both sides use the
 * shared clinic/server timezone, same convention as `toLocalTimestamp`.
 */
export function slotStatusCondition(status: SlotStatus, table = "booking_slots"): string {
  const endsAt = `"${table}"."slot_date" + "${table}"."end_time"`;
  if (status === "expired") return `now() > ${endsAt}`;
  if (status === "inactive") {
    return `"${table}"."is_active" = false AND now() <= ${endsAt}`;
  }
  return `"${table}"."is_active" = true AND now() <= ${endsAt}`;
}

/** A slot can still take bookings only when it is derived-active. */
export function isBookableStatus(status: SlotStatus): boolean {
  return status === "active";
}
