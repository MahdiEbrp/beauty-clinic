import { z } from "zod";
import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { changeUserPassword } from "@/lib/users/service";
import { changePasswordSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const POST = withSecurity(
  { auth: "required", permissions: "users.manage", validate: { body: changePasswordSchema }, audit: true },
  async (_request, ctx) => {
    const targetId = ctx.params?.id;
    if (!targetId || !z.uuid().safeParse(targetId).success) return jsonError("INVALID_USER_ID", "Invalid user id.", 400);
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await changeUserPassword(targetId, body.password, false);
    return jsonOk({ ok: true });
  },
);
