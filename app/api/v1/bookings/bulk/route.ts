import { jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteBookings,
  findBookingIds,
  setBookingsStatus,
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
    const ids =
      input.scope === "filtered"
        ? await findBookingIds(input.filters ?? {})
        : [...new Set(input.ids ?? [])];

    let blocked: string[] = [];
    try {
      if (input.action === "pay") await setBookingsStatus(ids, "paid");
      else if (input.action === "done") await setBookingsStatus(ids, "done");
      else if (input.action === "refund") await setBookingsStatus(ids, "refunded");
      else await deleteBookings(ids);
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