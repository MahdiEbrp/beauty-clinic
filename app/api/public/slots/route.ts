import { jsonOk, withSecurity } from "@/lib/api/security";
import { availableSlots } from "@/lib/bookings/slots";
import { availableSlotsQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Public availability feed for a single date. Only slots that can still
 * accept a booking (active, `capacity - bookedCount > 0`) are returned.
 */
export const GET = withSecurity(
  { auth: "public", validate: { query: availableSlotsQuerySchema } },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const slots = await availableSlots(query.date, query.serviceId);
    return jsonOk(slots);
  },
);
