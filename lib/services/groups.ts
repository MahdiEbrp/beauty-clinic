import {
  and,
  count,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type {
  CreateServiceGroupInput,
  UpdateServiceGroupInput,
} from "@/lib/validation/services";
import type {
  ServiceGroupStatusFilter,
} from "@/lib/validation/service-groups-admin";
import { db } from "@/src/db";
import { serviceCategories, serviceGroups, serviceGroupsI18n } from "@/src/db/schema";
import { bustPublicCatalogCache } from "./public-catalog";
import { assertSlugAvailable, isUniqueViolation, mapGroupRow, uniqueSlugError } from "./helpers";
import {
  emptyGroupContent,
  loadGroupTranslations,
  upsertGroupTranslation,
} from "./i18n";
import type { AdminServiceGroup, ListServiceGroupsResult, Locale, ServiceGroupContent } from "./types";

/** Shared search/status filter used by the paginated list and id lookup. */
function groupListConditions(opts: {
  search?: string;
  status?: ServiceGroupStatusFilter;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(serviceGroups.slug, term),
        sql`exists (
          select 1 from ${serviceGroupsI18n}
          where ${serviceGroupsI18n.groupId} = ${serviceGroups.id}
            and ${serviceGroupsI18n.name} ilike ${term}
        )`,
      ),
    );
  }
  if (opts.status === "active") conditions.push(eq(serviceGroups.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(serviceGroups.isActive, false));
  return conditions;
}

export async function listGroups(): Promise<AdminServiceGroup[]> {
  const rows = await db
    .select()
    .from(serviceGroups)
    .orderBy(serviceGroups.displayOrder, serviceGroups.createdAt);
  const groupTr = await loadGroupTranslations(rows.map((row) => row.id));

  const categoryRows = await db
    .select({ groupId: serviceCategories.groupId })
    .from(serviceCategories);
  const counts = new Map<string, number>();
  for (const row of categoryRows) {
    counts.set(row.groupId, (counts.get(row.groupId) ?? 0) + 1);
  }

  return rows.map((row) => {
    const tr = groupTr.get(row.id) ?? { fa: emptyGroupContent(), en: emptyGroupContent() };
    return mapGroupRow(row, tr, counts.get(row.id) ?? 0);
  });
}

/**
 * Paginated, filterable list of service groups for the management screen.
 * Searches slug + bilingual names, ordered by displayOrder then createdAt.
 */
export async function listServiceGroups(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: ServiceGroupStatusFilter;
}): Promise<ListServiceGroupsResult> {
  const { page, perPage, search, status = "all" } = opts;
  const offset = (page - 1) * perPage;
  const where = and(...groupListConditions({ search, status }));

  const [countRow] = await db
    .select({ value: count() })
    .from(serviceGroups)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select()
    .from(serviceGroups)
    .where(where)
    .orderBy(serviceGroups.displayOrder, serviceGroups.createdAt)
    .limit(perPage)
    .offset(offset);

  const ids = rows.map((row) => row.id);
  const groupTr = await loadGroupTranslations(ids);
  const categoryRows = ids.length
    ? await db
        .select({ groupId: serviceCategories.groupId })
        .from(serviceCategories)
        .where(inArray(serviceCategories.groupId, ids))
    : [];
  const counts = new Map<string, number>();
  for (const row of categoryRows) {
    counts.set(row.groupId, (counts.get(row.groupId) ?? 0) + 1);
  }

  return {
    items: rows.map((row) => {
      const tr =
        groupTr.get(row.id) ?? { fa: emptyGroupContent(), en: emptyGroupContent() };
      return mapGroupRow(row, tr, counts.get(row.id) ?? 0);
    }),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/** Returns the group ids matching the given search/status filters. */
export async function findGroupIds(opts: {
  search?: string;
  status?: ServiceGroupStatusFilter;
}): Promise<string[]> {
  const where = and(...groupListConditions(opts));
  const rows = await db
    .select({ id: serviceGroups.id })
    .from(serviceGroups)
    .where(where);
  return rows.map((row) => row.id);
}

export async function getGroup(id: string): Promise<AdminServiceGroup> {
  const row = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, id),
  });
  if (!row) throw new ApiError(404, "GROUP_NOT_FOUND", "Service group not found.");

  const [countRow] = await db
    .select({ value: count() })
    .from(serviceCategories)
    .where(eq(serviceCategories.groupId, id));
  const tr = (await loadGroupTranslations([id])).get(id) ?? {
    fa: emptyGroupContent(),
    en: emptyGroupContent(),
  };

  return mapGroupRow(row, tr, countRow?.value ?? 0);
}

export async function createGroup(
  input: CreateServiceGroupInput,
): Promise<{ id: string }> {
  try {
    const result = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(serviceGroups)
        .values({
          slug: input.slug,
          icon: input.icon ?? null,
          image: input.image ?? null,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
        })
        .returning({ id: serviceGroups.id });
      if (!row) throw new ApiError(500, "GROUP_CREATE_FAILED", "Could not create service group.");

      const translations = input.translations;
      await tx.insert(serviceGroupsI18n).values([
        {
          groupId: row.id,
          locale: "fa",
          name: translations.fa.name,
          description: translations.fa.description ?? null,
          seoTitle: translations.fa.seoTitle ?? null,
          seoDescription: translations.fa.seoDescription ?? null,
        },
        {
          groupId: row.id,
          locale: "en",
          name: translations.en.name,
          description: translations.en.description ?? null,
          seoTitle: translations.en.seoTitle ?? null,
          seoDescription: translations.en.seoDescription ?? null,
        },
      ]);

      return { id: row.id };
    });

    // Invalidate the cached public feed so the new group shows up now.
    await bustPublicCatalogCache();
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("group");
    throw error;
  }
}

export async function updateGroup(
  id: string,
  input: UpdateServiceGroupInput,
): Promise<void> {
  const existing = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, "GROUP_NOT_FOUND", "Service group not found.");

  if (input.slug !== undefined) {
    await assertSlugAvailable("service_groups", input.slug, id);
  }

  try {
    await db.transaction(async (tx) => {
      const { translations, ...rest } = input;
      if (Object.keys(rest).length > 0) {
        await tx.update(serviceGroups).set(rest).where(eq(serviceGroups.id, id));
      }
      if (translations) {
        const entries = Object.entries(translations) as [Locale, Partial<ServiceGroupContent>][];
        for (const [locale, content] of entries) {
          if (!content) continue;
          await upsertGroupTranslation(tx, id, locale, content);
        }
      }
    });

    // Invalidate the cached public feed so the edits are reflected now.
    await bustPublicCatalogCache();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("group");
    throw error;
  }
}

export async function deleteGroup(id: string): Promise<void> {
  const existing = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, "GROUP_NOT_FOUND", "Service group not found.");

  await db.delete(serviceGroups).where(eq(serviceGroups.id, id));

  // Invalidate the cached public feed so the removed group disappears now.
  await bustPublicCatalogCache();
}