import "server-only";

import { and, eq, ilike, inArray, isNull, or, type SQL } from "drizzle-orm";

import { db } from "@/src/db";
import { paymentProviders } from "@/src/db/schema";

type ProviderFilters = {
  search?: string;
  status?: string;
};

function providerConditions(opts: ProviderFilters): SQL[] {
  const conditions: SQL[] = [isNull(paymentProviders.deletedAt)];
  if (opts.status === "active") conditions.push(eq(paymentProviders.isActive, true));
  if (opts.status === "inactive") conditions.push(eq(paymentProviders.isActive, false));
  if (opts.search?.trim()) {
    const term = `%${opts.search.trim()}%`;
    const condition = or(
      ilike(paymentProviders.name, term),
      ilike(paymentProviders.kind, term),
    );
    if (condition) conditions.push(condition);
  }
  return conditions;
}

/** Returns the provider ids matching the given filters (used for bulk actions). */
export async function findProviderIds(filters: ProviderFilters): Promise<string[]> {
  const where = and(...providerConditions(filters));
  const rows = await db
    .select({ id: paymentProviders.id })
    .from(paymentProviders)
    .where(where);
  return rows.map((row) => row.id);
}

/** Sets active/inactive on a set of providers in one query. */
export async function setProvidersActive(
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(paymentProviders)
    .set({ isActive, updatedAt: new Date() })
    .where(inArray(paymentProviders.id, ids));
}

/**
 * Bulk soft-deletes providers (all providers are eligible — providers have no
 * referential dependency that blocks deletion). Returns an empty failures list
 * since soft-delete never blocks.
 */
export async function deleteProviders(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  await db
    .update(paymentProviders)
    .set({
      isActive: false,
      isDefault: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(inArray(paymentProviders.id, ids));
  return [];
}