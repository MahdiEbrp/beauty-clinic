import { and, eq, inArray, isNull } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/src/db";
import { roles, userRoles, users } from "@/src/db/schema";

/**
 * Roles that manage internal staff — only `users.manage` may grant these.
 * `users.write` alone (e.g. a receptionist) must never be able to mint an
 * admin/doctor/receptionist account, so it is capped at `customer` grants.
 */
const STAFF_ROLES = new Set(["admin", "doctor", "receptionist"]);

/** Whatever role the actor may NOT grant based on their permissions. */
function assertCanGrantRole(
  actorPermissions: readonly string[],
  roleKey: string,
): void {
  if (STAFF_ROLES.has(roleKey) && !hasPermission(actorPermissions, "users.manage")) {
    throw new ApiError(
      403,
      "FORBIDDEN_ROLE",
      "Only user managers may assign staff roles.",
    );
  }
}

async function resolveRoleId(roleKey: string): Promise<string | undefined> {
  const role = await db.query.roles.findFirst({
    where: eq(roles.key, roleKey),
    columns: { id: true },
  });
  return role?.id;
}

async function userHasRole(userId: string, roleKey: string): Promise<boolean> {
  const roleId = await resolveRoleId(roleKey);
  if (!roleId) return false;
  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .limit(1);
  return rows.length > 0;
}

/** Ids of currently-active admin users. */
async function activeAdminIds(): Promise<Set<string>> {
  const roleId = await resolveRoleId("admin");
  if (!roleId) return new Set();
  const holderRows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.roleId, roleId));
  if (holderRows.length === 0) return new Set();
  const activeRows = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        inArray(users.id, [...new Set(holderRows.map((row) => row.userId))]),
        eq(users.isActive, true),
        eq(users.isBanned, false),
        isNull(users.deletedAt),
      ),
    );
  return new Set(activeRows.map((row) => row.id));
}

/** Blocks demoting/deactivating/removing the last active admin account. */
async function assertNotLastActiveAdmin(userId: string): Promise<void> {
  if (!(await userHasRole(userId, "admin"))) return;
  if ((await activeAdminIds()).size <= 1) {
    throw new ApiError(
      409,
      "LAST_ADMIN",
      "This is the last active admin account; it cannot be demoted or removed.",
    );
  }
}

export { assertCanGrantRole, assertNotLastActiveAdmin };