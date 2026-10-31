import { jsonOk, withSecurity } from "@/lib/api/security";
import { createBooking, createBookingGroup, listBookings } from "@/lib/bookings/service";
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
      entityId: (ctx) => {
        const body = ctx.body as { groupId?: string; items?: Array<{ groupId: string }> };
        if (body?.items?.length) {
          // Group booking — groupRef is generated server-side; use first group id as reference.
          return body.items[0].groupId;
        }
        return body?.groupId;
      },
      action: "created",
    },
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();

    if (body.items && body.items.length > 0) {
      // Multi-service booking: one group ref, many items sharing one slot.
      const result = await createBookingGroup({
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        locale: body.locale,
        notes: body.notes ?? null,
        items: body.items.map((item) => ({
          groupId: item.groupId,
          slotId: item.slotId,
          quantity: item.quantity,
        })),
      });
      return jsonOk(result, 201);
    }

    // Single service booking.
    if (!body.groupId || !body.slotId) {
      throw new Error("groupId and slotId are required for single booking.");
    }
    const booking = await createBooking({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      groupId: body.groupId,
      slotId: body.slotId,
      locale: body.locale,
      notes: body.notes ?? null,
    });
    return jsonOk(booking, 201);
  },
);
