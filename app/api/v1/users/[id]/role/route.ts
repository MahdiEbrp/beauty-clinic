import { z } from "zod";
import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { updateUserRole } from "@/lib/users/service";
import { changeRoleSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const PATCH = withSecurity(
  { auth: "required", permissions: "users.manage", validate: { body: changeRoleSchema }, audit: true },
  async (_request, ctx) => {
    const targetId = ctx.params?.id;
    if (!targetId || !z.uuid().safeParse(targetId).success) return jsonError("INVALID_USER_ID", "Invalid user id.", 400);
    await updateUserRole(targetId, ctx.body!.roleKey);
    return jsonOk({ ok: true });
  },
);
