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
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();

    // Changing your own password goes through the profile flow, which proves
    // knowledge of the current password. Allowing a manage session to reset
    // its own password makes a stolen admin session a permanent takeover.
    if (session.user.id === targetId) {
      return jsonError("SELF_PASSWORD", "Change your own password from your profile settings.", 400);
    }

    await changeUserPassword(targetId, body.password, false);
    return jsonOk({ ok: true });
  },
);
