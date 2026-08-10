import { withSecurity, jsonOk } from "@/lib/api/security";
import { findUserIds, resetUserPassword, softDeleteUser, updateUserRole, updateUserStatus } from "@/lib/users/service";
import { bulkUsersSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const POST = withSecurity(
  { auth: "required", permissions: "users.manage", validate: { body: bulkUsersSchema }, audit: true },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const input = body;
    const ids = (input.scope === "filtered"
      ? await findUserIds({ search: input.filters?.search, status: input.filters?.status, role: input.filters?.role })
      : [...new Set(input.ids ?? [])]).filter((id) => id !== session.user.id);
    const failures: Array<{ id: string; code: string }> = [];
    const temporaryPasswords: Array<{ id: string; password: string }> = [];

    for (const id of ids) {
      try {
        if (id === session.user.id && ["deactivate", "ban", "delete"].includes(input.action)) throw new Error("SELF_LOCKOUT");
        if (input.action === "activate") await updateUserStatus(id, { isActive: true });
        if (input.action === "deactivate") await updateUserStatus(id, { isActive: false });
        if (input.action === "ban") await updateUserStatus(id, { isBanned: true });
        if (input.action === "unban") await updateUserStatus(id, { isBanned: false });
        if (input.action === "change-role") {
          const roleKey = input.roleKey ?? (() => { throw new Error("Role key is missing"); })();
          await updateUserRole(id, roleKey);
        }
        if (input.action === "delete") await softDeleteUser(id);
        if (input.action === "reset-password") temporaryPasswords.push({ id, password: await resetUserPassword(id) });
      } catch (error) {
        failures.push({ id, code: error instanceof Error ? error.message : "OPERATION_FAILED" });
      }
    }

    return jsonOk({ requested: ids.length, succeeded: ids.length - failures.length, failures, temporaryPasswords });
  },
);
