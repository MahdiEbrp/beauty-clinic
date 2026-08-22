import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { createBooking } from "@/lib/bookings/service";
import { createBookingSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Creates a pending booking for the selected service + slot. The deposit
 * (`booking.price`) is snapshotted onto the row and paid on the /pay step.
 */
export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      key: (request) => `booking:create:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: createBookingSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const booking = await createBooking(body);
    return jsonOk(booking, 201);
  },
);
