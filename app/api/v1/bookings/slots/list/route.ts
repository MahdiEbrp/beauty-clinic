import { jsonOk, withSecurity } from "@/lib/api/security";
import { listSlotsAdmin } from "@/lib/bookings/slots-admin";
import { listSlotsAdminQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
    validate: { query: listSlotsAdminQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const result = await listSlotsAdmin(query);
    return jsonOk(result);
  },
);