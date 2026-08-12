import { and, eq, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { cacheDel } from "@/lib/cache";
import { db } from "@/src/db";
import { settings, type Setting } from "@/src/db/schema";

/** Shared cache key for the system-wide settings map (see lib/settings/loader.ts). */
export const SYSTEM_SETTINGS_CACHE_KEY = "settings:system";

export type PaginatedResponse = {
  items: Setting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function inferType(value: unknown): string {
  if (value === null) return "object";
  if (Array.isArray(value)) return "array";
  if (value !== null && typeof value === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  return "boolean";
}

export async function upsertSetting(
  key: string,
  value: unknown,
  options?: {
    userId?: string;
    type?: string;
    scope?: string;
  },
): Promise<Setting> {
  // `settings.value` is NOT NULL — reject null up front instead of letting it
  // surface as an unhandled Postgres constraint violation.
  if (value === null) {
    throw new ApiError(400, "INVALID_SETTING_VALUE", "Setting value cannot be null.");
  }

  const resolvedType = options?.type ?? inferType(value);
  const scope = options?.scope ?? "user";

  if (scope === "system") {
    const [row] = await db
      .insert(settings)
      .values({ scope: "system", key, value, type: resolvedType })
      .onConflictDoUpdate({
        target: [settings.key],
        targetWhere: eq(settings.scope, "system"),
        set: { value, type: resolvedType, updatedAt: new Date() },
      })
      .returning();
    await cacheDel(SYSTEM_SETTINGS_CACHE_KEY);
    return row;
  }

  const userId = options?.userId;
  const [row] = await db
    .insert(settings)
    .values({
      scope: "user",
      userId: userId ?? undefined,
      key,
      value,
      type: resolvedType,
    })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      targetWhere: eq(settings.scope, "user"),
      set: { value, type: resolvedType, updatedAt: new Date() },
    })
    .returning();

  return row;
}

export async function getUserSettings(userId: string): Promise<Setting[]> {
  return db
    .select()
    .from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.scope, "user")))
    .orderBy(settings.key);
}

export async function getSystemSettings(): Promise<Setting[]> {
  return db
    .select()
    .from(settings)
    .where(eq(settings.scope, "system"))
    .orderBy(settings.key);
}

export async function getAllSettings(
  page: number,
  limit: number,
  opts?: { userId?: string; scope?: string },
): Promise<PaginatedResponse> {
  const offset = (page - 1) * limit;

  const filters: ReturnType<typeof eq>[] = [];

  if (opts?.scope) {
    filters.push(eq(settings.scope, opts.scope));
  }

  if (opts?.userId) {
    filters.push(eq(settings.userId, opts.userId));
  }

  const conditions = filters.length > 0 ? and(...filters) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(settings)
    .where(conditions);

  const total = Number(countResult.count);

  const items = await db
    .select()
    .from(settings)
    .where(conditions)
    .orderBy(settings.scope, settings.userId, settings.key)
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function deleteSetting(
  key: string,
  opts?: { userId?: string; scope?: string },
): Promise<void> {
  const scope = opts?.scope ?? "user";

  if (scope === "system") {
    await db
      .delete(settings)
      .where(and(eq(settings.scope, "system"), eq(settings.key, key)));
    await cacheDel(SYSTEM_SETTINGS_CACHE_KEY);
  } else {
    const userId = opts?.userId;
    if (!userId) throw new Error("userId is required for user-scoped delete");
    await db
      .delete(settings)
      .where(
        and(
          eq(settings.scope, "user"),
          eq(settings.userId, userId),
          eq(settings.key, key),
        ),
      );
  }
}
