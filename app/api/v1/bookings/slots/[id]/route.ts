import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { deleteSlot, updateSlot } from "@/lib/bookings/slots";
import { updateSlotSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_ID", "Invalid booking id.", 400);
}

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: updateSlotSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const slot = await updateSlot(id, body);
    return jsonOk(slot);
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "appointments.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteSlot(id);
    return jsonOk({ ok: true });
  },
);
