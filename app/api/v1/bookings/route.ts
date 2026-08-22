import { jsonOk, withSecurity } from "@/lib/api/security";
import { listBookings } from "@/lib/bookings/service";
import { listBookingsQuerySchema } from "@/lib/validation/bookings";

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
