import { jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteBookingGroups,
  findBookingGroupRefs,
  resolveBookingGroupRefs,
  setBookingGroupsStatus,
} from "@/lib/bookings/admin";
import { bulkBookingsSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.manage",
    validate: { body: bulkBookingsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const groupRefs =
      input.scope === "filtered"
        ? await findBookingGroupRefs(input.filters ?? {})
        : await resolveBookingGroupRefs([...new Set(input.ids ?? [])]);

    let blocked: string[] = [];
    try {
      if (input.action === "pay") await setBookingGroupsStatus(groupRefs, "paid");
      else if (input.action === "done") await setBookingGroupsStatus(groupRefs, "done");
      else if (input.action === "refund") await setBookingGroupsStatus(groupRefs, "refunded");
      else await deleteBookingGroups(groupRefs);
    } catch {
      blocked = groupRefs;
    }

    const failures = blocked.map((id) => ({ id, code: "OPERATION_FAILED" }));
    return jsonOk({
      requested: groupRefs.length,
      succeeded: groupRefs.length - failures.length,
      failures,
    });
  },
);
