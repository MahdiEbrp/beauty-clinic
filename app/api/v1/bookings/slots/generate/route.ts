import { jsonOk, withSecurity } from "@/lib/api/security";
import { ensureAutoSlots } from "@/lib/bookings/generator";

export const runtime = "nodejs";

/**
 * Admin trigger for the slot auto-generator. Runs the same idempotent,
 * single-writer job the daily cron runs, so an admin can materialize the
 * window immediately after editing working hours, capacity or the interval.
 */
export const POST = withSecurity(
  { auth: "required", permissions: "appointments.manage", audit: true },
  async () => {
    // Manual admin trigger — ignores the `booking.slot_auto` toggle (that
    // gate only controls the daily cron), so generation always runs.
    const result = await ensureAutoSlots(true);
    return jsonOk(result, 200);
  },
);