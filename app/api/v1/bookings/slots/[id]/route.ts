import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { deleteSlot, getSlot, updateSlot } from "@/lib/bookings/slots";
import { updateSlotSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_ID", "Invalid slot id.", 400);
}

function slotNotFound() {
  return jsonError("SLOT_NOT_FOUND", "Slot not found.", 404);
}

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    try {
      const slot = await getSlot(id);
      return jsonOk(slot);
    } catch {
      return slotNotFound();
    }
  },
);

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
    try {
      const slot = await updateSlot(id, body);
      return jsonOk(slot);
    } catch {
      return slotNotFound();
    }
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "appointments.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    try {
      await deleteSlot(id);
      return jsonOk({ ok: true });
    } catch {
      return slotNotFound();
    }
  },
);
