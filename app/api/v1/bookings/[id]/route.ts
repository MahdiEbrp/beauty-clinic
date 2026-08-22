import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { updateBookingStatus } from "@/lib/bookings/service";
import { bookingStatusUpdateSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_ID", "Invalid booking id.", 400);
}

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: bookingStatusUpdateSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const booking = await updateBookingStatus(id, body.status);
    return jsonOk(booking);
  },
);
