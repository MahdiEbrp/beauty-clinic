import "server-only";

import { cache } from "react";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/src/db";
import { permissions, rolePermissions, roles, sessions, userRoles, users } from "@/src/db/schema";
import { getLocale } from "next-intl/server";
import { localizedHref } from "@/lib/site";
import { decryptSession, SESSION_COOKIE } from "./jwt";
import { hasPermission, hasRole, type RoleKey } from "./rbac";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  userId: string;
  user: AuthUser;
};

async function authRedirect(path: "/login" | "/forbidden"): Promise<never> {
  const locale = await getLocale();
  redirect(localizedHref(locale, path));
}

async function clearInvalidSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const claims = await decryptSession(token);
  if (!claims) return null;

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, claims.sessionId), isNull(sessions.revokedAt)),
  });
  if (!session) {
    await clearInvalidSession();
    return null;
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    await clearInvalidSession();
    return null;
  }
  if (session.userId !== claims.userId || session.tokenHash !== claims.tokenHash) {
    await clearInvalidSession();
    return null;
  }

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.id, session.userId),
      isNull(users.deletedAt),
      eq(users.isActive, true),
      eq(users.isBanned, false),
    ),
    columns: {
      id: true,
      email: true,
      fullName: true,
      passwordChangedAt: true,
    },
  });
  if (!user) {
    await clearInvalidSession();
    return null;
  }

  if (user.passwordChangedAt && session.createdAt.getTime() < user.passwordChangedAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    await clearInvalidSession();
    return null;
  }

  const rows = await db
    .select({ roleKey: roles.key, permissionKey: permissions.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, user.id));

  const roleSet = new Set<string>();
  const permissionSet = new Set<string>();
  for (const row of rows) {
    roleSet.add(row.roleKey);
    if (row.permissionKey) permissionSet.add(row.permissionKey);
  }

  return {
    userId: user.id,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: [...roleSet],
      permissions: [...permissionSet],
    },
  };
});

export const requireAuth = cache(async (): Promise<AuthSession> => {
  const session = await getSession();
  if (!session) return authRedirect("/login");
  return session;
});

export async function requireRole(...allowedRoles: readonly RoleKey[]): Promise<AuthSession> {
  const session = await requireAuth();
  if (!hasRole(session.user.roles, ...allowedRoles)) return authRedirect("/forbidden");
  return session;
}

export async function requirePermission(
  required: string | readonly string[],
): Promise<AuthSession> {
  const session = await requireAuth();
  if (!hasPermission(session.user.permissions, required)) return authRedirect("/forbidden");
  return session;
}
