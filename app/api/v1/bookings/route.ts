import { jsonOk, withSecurity } from "@/lib/api/security";
import { createBooking, listBookings } from "@/lib/bookings/service";
import { createBookingSchema, listBookingsQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
    validate: { query: listBookingsQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const result = await listBookings(query);
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: createBookingSchema },
    audit: true,
    notification: {
      entityType: "booking",
      entityId: (ctx) => (ctx.body as { groupId?: string } | undefined)?.groupId,
      action: "created",
    },
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const booking = await createBooking(body);
    return jsonOk(booking, 201);
  },
);
