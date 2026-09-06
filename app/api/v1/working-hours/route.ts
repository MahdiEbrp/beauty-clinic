import { jsonOk, withSecurity } from "@/lib/api/security";
import { createWorkingHour } from "@/lib/bookings/working-hours-admin";
import { createWorkingHourSchema } from "@/lib/validation/working-hours";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: createWorkingHourSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const row = await createWorkingHour(body);
    return jsonOk(row, 201);
  },
);