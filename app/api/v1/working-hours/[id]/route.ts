import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteWorkingHour,
  getWorkingHour,
  updateWorkingHour,
} from "@/lib/bookings/working-hours-admin";
import { updateWorkingHourSchema } from "@/lib/validation/working-hours";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_ID", "Invalid working-hours id.", 400);
}

function notFound() {
  return jsonError("WORKING_HOURS_NOT_FOUND", "Working hours not found.", 404);
}

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const row = await getWorkingHour(id);
    return row ? jsonOk(row) : notFound();
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: updateWorkingHourSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    // Let ApiError (404 not-found, 400 pattern-too-late) reach handleApiError.
    const row = await updateWorkingHour(id, body);
    return jsonOk(row);
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "appointments.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteWorkingHour(id);
    return jsonOk({ ok: true });
  },
);
