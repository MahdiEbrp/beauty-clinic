import { jsonOk, withSecurity } from "@/lib/api/security";
import { listWorkingHoursAdmin } from "@/lib/bookings/working-hours-admin";
import { listWorkingHoursQuerySchema } from "@/lib/validation/working-hours";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
    validate: { query: listWorkingHoursQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const result = await listWorkingHoursAdmin(query);
    return jsonOk(result);
  },
);