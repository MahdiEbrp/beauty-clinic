import { jsonOk, withSecurity } from "@/lib/api/security";
import { deleteSlots, findSlotIds, setSlotsActive } from "@/lib/bookings/slots-admin";
import { bulkSlotsSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.manage",
    validate: { body: bulkSlotsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findSlotIds(input.filters ?? {})
        : [...new Set(input.ids ?? [])];

    let blocked: string[] = [];
    try {
      if (input.action === "activate") await setSlotsActive(ids, true);
      else if (input.action === "deactivate") await setSlotsActive(ids, false);
      else blocked = await deleteSlots(ids);
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