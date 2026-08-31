import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { deleteService, getService, updateService } from "@/lib/services/service";
import { updateServiceSchema } from "@/lib/validation/services";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_SERVICE_ID", "Invalid service id.", 400);
}

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const service = await getService(id);
    return jsonOk(service);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateServiceSchema, bodyLimit: 512 * 1024 },
    audit: true,
    notification: {
      entityType: "service",
      entityId: (ctx) => ctx.params?.id,
      entityLabel: () => "Service updated",
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateService(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "services.manage",
    audit: true,
    notification: {
      entityType: "service",
      entityId: (ctx) => ctx.params?.id,
      entityLabel: () => "Service deleted",
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteService(id);
    return jsonOk({ ok: true });
  },
);
