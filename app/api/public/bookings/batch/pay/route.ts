import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { payBookingGroup } from "@/lib/bookings/service";
import { payBookingGroupSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Mock payment for a whole booking GROUP (by any member id or group ref):
 * charges the flat deposit once and marks all rows paid with one reference.
 */
export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 20,
      windowMs: 60 * 60 * 1000,
      key: (request) => `booking:pay:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: payBookingGroupSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const booking = await payBookingGroup(body);
    return jsonOk(booking);
  },
);