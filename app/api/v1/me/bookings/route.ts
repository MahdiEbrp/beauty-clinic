import { jsonOk, withSecurity } from "@/lib/api/security";
import { listMyBookings, loadBookingOwner } from "@/lib/bookings/mine";
import { myReservationsQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * The signed-in customer's own reservations (paginated, filterable). Scoped to
 * the caller — there is no way to ask for someone else's orders.
 */
export const GET = withSecurity(
  {
    auth: "required",
    validate: { query: myReservationsQuerySchema },
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const owner = await loadBookingOwner(session.user.id);
    return jsonOk(await listMyBookings(owner, query));
  },
);
