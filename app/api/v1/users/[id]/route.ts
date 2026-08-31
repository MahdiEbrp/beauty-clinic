import { z } from "zod";

import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { softDeleteUser, updateUserStatus } from "@/lib/users/service";
import { updateUserStatusSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "users.manage",
    validate: { body: updateUserStatusSchema },
    audit: true,
    notification: {
      entityType: "user",
      entityId: (ctx) => ctx.params?.id,
      entityLabel: () => "User status updated",
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const targetId = ctx.params?.id;
    if (!targetId || !z.uuid().safeParse(targetId).success) {
      return jsonError("INVALID_USER_ID", "Invalid user id.", 400);
    }

    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();

    // Admins must not be able to lock themselves out of the system.
    if (session.user.id === targetId) {
      if (body.isActive === false || body.isBanned === true) {
        return jsonError(
          "SELF_LOCKOUT",
          "You cannot deactivate or ban your own account.",
          400,
        );
      }
    }

    await updateUserStatus(targetId, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "users.manage",
    audit: true,
    notification: {
      entityType: "user",
      entityId: (ctx) => ctx.params?.id,
      entityLabel: () => "User deleted",
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const targetId = ctx.params?.id;
    if (!targetId || !z.uuid().safeParse(targetId).success) return jsonError("INVALID_USER_ID", "Invalid user id.", 400);
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    if (session.user.id === targetId) return jsonError("SELF_LOCKOUT", "You cannot delete your own account.", 400);
    await softDeleteUser(targetId);
    return jsonOk({ ok: true });
  },
);
