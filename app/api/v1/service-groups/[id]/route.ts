import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteGroup,
  getGroup,
  updateGroup,
} from "@/lib/services/service";
import { updateServiceGroupSchema } from "@/lib/validation/services";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_GROUP_ID", "Invalid service group id.", 400);
}

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const group = await getGroup(id);
    return jsonOk(group);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateServiceGroupSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await updateGroup(id, ctx.body!);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "services.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteGroup(id);
    return jsonOk({ ok: true });
  },
);
