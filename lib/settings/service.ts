import { and, eq, sql } from "drizzle-orm";

import { db } from "@/src/db";
import { settings, type Setting } from "@/src/db/schema";

export type PaginatedResponse = {
  items: Setting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function upsertSetting(
  userId: string,
  key: string,
  value: unknown,
  type?: string,
): Promise<Setting> {
  const resolvedType =
    type ??
    ((v: unknown) => {
      if (Array.isArray(v)) return "array";
      if (v !== null && typeof v === "object") return "object";
      if (typeof v === "string") return "string";
      if (typeof v === "number") return "number";
      return "boolean";
    })(value);

  const [row] = await db
    .insert(settings)
    .values({ userId, key, value, type: resolvedType })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value, type: resolvedType, updatedAt: new Date() },
    })
    .returning();

  return row;
}

export async function getUserSettings(userId: string): Promise<Setting[]> {
  return db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .orderBy(settings.key);
}

export async function getAllSettings(
  page: number,
  limit: number,
  userId?: string,
): Promise<PaginatedResponse> {
  const offset = (page - 1) * limit;
  const conditions = userId ? and(eq(settings.userId, userId)) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(settings)
    .where(conditions);

  const total = Number(countResult.count);

  const items = await db
    .select()
    .from(settings)
    .where(conditions)
    .orderBy(settings.userId, settings.key)
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

export async function deleteSetting(userId: string, key: string): Promise<void> {
  await db
    .delete(settings)
    .where(and(eq(settings.userId, userId), eq(settings.key, key)));
}
