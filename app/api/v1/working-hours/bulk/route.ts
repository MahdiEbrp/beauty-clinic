import { jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteWorkingHours,
  findWorkingHourIds,
  setWorkingHoursActive,
} from "@/lib/bookings/working-hours-admin";
import { bulkWorkingHoursSchema } from "@/lib/validation/working-hours";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.manage",
    validate: { body: bulkWorkingHoursSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findWorkingHourIds(input.filters ?? {})
        : [...new Set(input.ids ?? [])];

    let blocked: string[] = [];
    try {
      if (input.action === "activate") await setWorkingHoursActive(ids, true);
      else if (input.action === "deactivate") await setWorkingHoursActive(ids, false);
      else blocked = await deleteWorkingHours(ids);
    } catch {
      blocked = ids;
    }

    const failures = blocked.map((id) => ({ id, code: "OPERATION_FAILED" }));
    return jsonOk({
      requested: ids.length,
      succeeded: ids.length - failures.length,
      failures,
    });
  },
);