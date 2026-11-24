import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { createBookingGroup } from "@/lib/bookings/service";
import { createBookingGroupSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Batch (multi-service) booking creation — same atomic group transaction as
 * `POST /api/public/bookings`; kept as a stable alias for the batch client.
 */
export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      key: (request) => `booking:create:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: createBookingGroupSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const group = await createBookingGroup({ ...body, sequential: true });
    return jsonOk(group, 201);
  },
);