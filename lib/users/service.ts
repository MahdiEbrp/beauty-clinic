import { and, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/src/db";
import { roles, sessions, userRoles, users } from "@/src/db/schema";
import type { UserStatusFilter } from "@/lib/validation/user";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  isBanned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[];
};

export type ListUsersResult = {
  items: AdminUser[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function createUser(input: {
  fullName: string;
  email: string;
  phone: string | null;
  password: string;
  roleKey: string;
}): Promise<{ id: string }> {
  const role = await db.query.roles.findFirst({ where: eq(roles.key, input.roleKey) });
  if (!role) throw new ApiError(400, "INVALID_ROLE", "The selected role does not exist.");

  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          passwordHash: await hashPassword(input.password),
        })
        .returning({ id: users.id });
      if (!user) throw new ApiError(500, "USER_CREATE_FAILED", "Could not create user.");
      await tx.insert(userRoles).values({ userId: user.id, roleId: role.id });
      return { id: user.id };
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new ApiError(409, "EMAIL_TAKEN", "A user with this email already exists.");
    }
    throw error;
  }
}

/**
 * Paginated, filterable list of non-deleted users with their role keys,
 * newest accounts first. Used by the dashboard user management screen.
 */
export async function listUsers(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: UserStatusFilter;
  role?: string;
}): Promise<ListUsersResult> {
  const { page, perPage, search, status = "all", role } = opts;
  const offset = (page - 1) * perPage;

  // `or()`/`and()` return `SQL | undefined`, so the list is typed accordingly
  // (drizzle's `.where()` accepts `SQL | undefined`).
  const conditions: (SQL | undefined)[] = [isNull(users.deletedAt)];
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(ilike(users.fullName, term), ilike(users.email, term)),
    );
  }
  if (status === "active") {
    conditions.push(and(eq(users.isActive, true), eq(users.isBanned, false)));
  } else if (status === "inactive") {
    conditions.push(eq(users.isActive, false));
  } else if (status === "banned") {
    conditions.push(eq(users.isBanned, true));
  }

  if (role) {
    conditions.push(
      sql`exists (
        select 1 from ${userRoles}
        inner join ${roles} on ${eq(userRoles.roleId, roles.id)}
        where ${eq(userRoles.userId, users.id)} and ${eq(roles.key, role)}
      )`,
    );
  }

  const where = and(...conditions);

  const [countRow] = await db.select({ value: count() }).from(users).where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      isActive: users.isActive,
      isBanned: users.isBanned,
      bannedAt: users.bannedAt,
      banReason: users.banReason,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(perPage)
    .offset(offset);

  const ids = rows.map((row) => row.id);
  const roleRows = ids.length
    ? await db
        .select({ userId: userRoles.userId, roleKey: roles.key })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(inArray(userRoles.userId, ids))
    : [];

  const rolesByUser = new Map<string, string[]>();
  for (const row of roleRows) {
    const list = rolesByUser.get(row.userId) ?? [];
    list.push(row.roleKey);
    rolesByUser.set(row.userId, list);
  }

  return {
    items: rows.map((row) => ({ ...row, roles: rolesByUser.get(row.id) ?? [] })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Updates a user's account state. Deactivating or banning a user immediately
 * signs out all of their sessions. Throws a 404 when the user doesn't exist.
 */
export async function updateUserStatus(
  userId: string,
  patch: { isActive?: boolean; isBanned?: boolean; banReason?: string | null },
): Promise<void> {
  const [existing] = await db
    .select({ id: users.id, isActive: users.isActive, isBanned: users.isBanned })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  if (!existing) throw new ApiError(404, "USER_NOT_FOUND", "User not found.");

  const isActive = patch.isActive ?? existing.isActive;
  const isBanned = patch.isBanned ?? existing.isBanned;

  const set: Record<string, unknown> = { isActive, isBanned };
  if (patch.isBanned !== undefined) {
    set.bannedAt = patch.isBanned ? new Date() : null;
    set.banReason = patch.isBanned ? (patch.banReason ?? null) : null;
  } else if (patch.banReason !== undefined) {
    set.banReason = patch.banReason;
  }

  await db.update(users).set(set).where(eq(users.id, userId));

  if (!isActive || isBanned) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}
