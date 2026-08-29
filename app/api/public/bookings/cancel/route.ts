import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { cancelBookingGroup } from "@/lib/bookings/service";
import { cancelBookingGroupSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Cancels a booking group after enforcing `booking.min_cancel_hours`
 * (24h by default). Frees the reserved seats immediately.
 */
export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      key: (request) => `booking:cancel:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: cancelBookingGroupSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await cancelBookingGroup(body.groupRef, body.phone);
    return jsonOk(result);
  },
);