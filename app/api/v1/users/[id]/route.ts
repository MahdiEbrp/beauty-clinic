import { z } from "zod";

import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { updateUserStatus } from "@/lib/users/service";
import { updateUserStatusSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "users.manage",
    validate: { body: updateUserStatusSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const targetId = ctx.params?.id;
    if (!targetId || !z.uuid().safeParse(targetId).success) {
      return jsonError("INVALID_USER_ID", "Invalid user id.", 400);
    }

    const patch = ctx.body!;

    // Admins must not be able to lock themselves out of the system.
    if (ctx.session?.user.id === targetId) {
      if (patch.isActive === false || patch.isBanned === true) {
        return jsonError(
          "SELF_LOCKOUT",
          "You cannot deactivate or ban your own account.",
          400,
        );
      }
    }

    await updateUserStatus(targetId, patch);
    return jsonOk({ ok: true });
  },
);
