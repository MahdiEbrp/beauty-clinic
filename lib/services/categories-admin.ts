import { and, count, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import type { CategoryStatusFilter } from "@/lib/validation/service-categories-admin";
import { db } from "@/src/db";
import { serviceCategories, serviceCategoriesI18n, services } from "@/src/db/schema";
import { mapCategoryRow } from "./helpers";
import {
  emptyGroupContent,
  loadCategoryTranslations,
  loadGroupTranslations,
} from "./i18n";
import type {
  AdminServiceCategory,
  ListServiceCategoriesResult,
} from "./types";

/** Shared search/status filter used by the paginated list and id lookup. */
function categoryListConditions(opts: {
  search?: string;
  status?: CategoryStatusFilter;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(serviceCategories.slug, term),
        sql`exists (
          select 1 from ${serviceCategoriesI18n}
          where ${serviceCategoriesI18n.categoryId} = ${serviceCategories.id}
            and ${serviceCategoriesI18n.name} ilike ${term}
        )`,
      ),
    );
  }
  if (opts.status === "active") conditions.push(eq(serviceCategories.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(serviceCategories.isActive, false));
  return conditions;
}

/** Normalizes category rows with their group + service context. */
async function toAdminCategories(
  rows: typeof serviceCategories.$inferSelect[],
): Promise<AdminServiceCategory[]> {
  const ids = rows.map((row) => row.id);
  const groupTr = await loadGroupTranslations(
    [...new Set(rows.map((row) => row.groupId))],
  );
  const [categoryTr, serviceRows] = await Promise.all([
    loadCategoryTranslations(ids),
    ids.length
      ? db
          .select({ categoryId: services.categoryId })
          .from(services)
          .where(inArray(services.categoryId, ids))
      : Promise.resolve([] as Array<{ categoryId: string }>),
  ]);
  const serviceCounts = new Map<string, number>();
  for (const row of serviceRows) {
    serviceCounts.set(row.categoryId, (serviceCounts.get(row.categoryId) ?? 0) + 1);
  }

  return rows.map((row) => {
    const tr = categoryTr.get(row.id) ?? {
      fa: emptyGroupContent(),
      en: emptyGroupContent(),
    };
    return mapCategoryRow(
      row,
      tr,
      groupTr.get(row.groupId)?.fa.name ?? "",
      serviceCounts.get(row.id) ?? 0,
    );
  });
}

/**
 * Paginated, filterable list of service categories for the management screen.
 * Searches slug + bilingual names, ordered by displayOrder then createdAt.
 */
export async function listServiceCategories(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: CategoryStatusFilter;
}): Promise<ListServiceCategoriesResult> {
  const { page, perPage, search, status = "all" } = opts;
  const offset = (page - 1) * perPage;
  const where = and(...categoryListConditions({ search, status }));

  const [countRow] = await db
    .select({ value: count() })
    .from(serviceCategories)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select()
    .from(serviceCategories)
    .where(where)
    .orderBy(serviceCategories.displayOrder, serviceCategories.createdAt)
    .limit(perPage)
    .offset(offset);

  return {
    items: await toAdminCategories(rows),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/** Returns the category ids matching the given search/status filters. */
export async function findCategoryIds(opts: {
  search?: string;
  status?: CategoryStatusFilter;
}): Promise<string[]> {
  const where = and(...categoryListConditions(opts));
  const rows = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(where);
  return rows.map((row) => row.id);
}

/**
 * Lightweight category options (id + fa name + group name) for the service
 * wizard's category picker. Batched translation lookup keeps it to minimal
 * queries.
 */
export async function listServiceCategoryOptions(): Promise<
  Array<{ id: string; name: string; groupId: string; groupName: string }>
> {
  const rows = await db
    .select({
      id: serviceCategories.id,
      groupId: serviceCategories.groupId,
    })
    .from(serviceCategories)
    .orderBy(serviceCategories.displayOrder, serviceCategories.createdAt);
  const categoryIds = rows.map((row) => row.id);
  const groupIds = [...new Set(rows.map((row) => row.groupId))];
  const [categoryTr, groupTr] = await Promise.all([
    loadCategoryTranslations(categoryIds),
    loadGroupTranslations(groupIds),
  ]);
  return rows.map((row) => ({
    id: row.id,
    name: categoryTr.get(row.id)?.fa.name ?? "",
    groupId: row.groupId,
    groupName: row.groupId ? groupTr.get(row.groupId)?.fa.name ?? "" : "",
  }));
}
