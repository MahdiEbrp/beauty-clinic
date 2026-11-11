import { jsonOk, withSecurity } from "@/lib/api/security";
import { bulkGenerateSlots } from "@/lib/bookings/slots";
import { bulkGenerateSlotsSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Admin bulk slot generator: date range + weekdays + time window + interval.
 * Creates one slot per start time for every matching date in the range.
 * Idempotent — existing (date, start_time) rows are skipped.
 */
export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.manage",
    validate: { body: bulkGenerateSlotsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => {
      throw new Error("Validation body is missing");
    })();
    const slots = await bulkGenerateSlots(body);
    return jsonOk(slots, 201);
  },
);
