import { withSecurity, jsonOk } from "@/lib/api/security";
import { findUserIds, resetUserPassword, softDeleteUser, updateUserRole, updateUserStatus } from "@/lib/users/service";
import { bulkUsersSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const POST = withSecurity(
  { auth: "required", permissions: "users.manage", validate: { body: bulkUsersSchema }, audit: true },
  async (_request, ctx) => {
    const input = ctx.body!;
    const ids = input.scope === "filtered"
      ? await findUserIds({ search: input.filters?.search, status: input.filters?.status, role: input.filters?.role })
      : [...new Set(input.ids ?? [])];
    const failures: Array<{ id: string; code: string }> = [];
    const temporaryPasswords: Array<{ id: string; password: string }> = [];

    for (const id of ids) {
      try {
        if (id === ctx.session?.user.id && ["deactivate", "ban", "delete"].includes(input.action)) throw new Error("SELF_LOCKOUT");
        if (input.action === "activate") await updateUserStatus(id, { isActive: true });
        if (input.action === "deactivate") await updateUserStatus(id, { isActive: false });
        if (input.action === "ban") await updateUserStatus(id, { isBanned: true });
        if (input.action === "unban") await updateUserStatus(id, { isBanned: false });
        if (input.action === "change-role") await updateUserRole(id, input.roleKey!);
        if (input.action === "delete") await softDeleteUser(id);
        if (input.action === "reset-password") temporaryPasswords.push({ id, password: await resetUserPassword(id) });
      } catch (error) {
        failures.push({ id, code: error instanceof Error ? error.message : "OPERATION_FAILED" });
      }
    }

    return jsonOk({ requested: ids.length, succeeded: ids.length - failures.length, failures, temporaryPasswords });
  },
);
