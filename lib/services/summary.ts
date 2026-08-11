import { db } from "@/src/db";
import {
  serviceCategories,
  serviceGroups,
  services,
} from "@/src/db/schema";
import { mapCategoryRow, mapGroupRow } from "./helpers";
import { emptyGroupContent, loadCategoryTranslations, loadGroupTranslations } from "./i18n";
import type { ServiceCatalogSummary } from "./types";

export async function getCatalogSummary(): Promise<ServiceCatalogSummary> {
  const groupRows = await db
    .select()
    .from(serviceGroups)
    .orderBy(serviceGroups.displayOrder, serviceGroups.createdAt);
  const categoryRows = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.displayOrder, serviceCategories.createdAt);
  const serviceRows = await db.select({ categoryId: services.categoryId }).from(services);

  const groupTr = await loadGroupTranslations(groupRows.map((row) => row.id));
  const categoryTr = await loadCategoryTranslations(categoryRows.map((row) => row.id));

  const groupIdSet = new Set(groupRows.map((row) => row.id));
  const categories = categoryRows.filter((row) => groupIdSet.has(row.groupId));

  const categoryCounts = new Map<string, number>();
  for (const row of categories) {
    categoryCounts.set(row.groupId, (categoryCounts.get(row.groupId) ?? 0) + 1);
  }
  const serviceCounts = new Map<string, number>();
  for (const row of serviceRows) {
    serviceCounts.set(row.categoryId, (serviceCounts.get(row.categoryId) ?? 0) + 1);
  }

  return {
    totalServices: serviceRows.length,
    groups: groupRows.map((row) => {
      const tr = groupTr.get(row.id) ?? { fa: emptyGroupContent(), en: emptyGroupContent() };
      return mapGroupRow(row, tr, categoryCounts.get(row.id) ?? 0);
    }),
    categories: categories.map((row) => {
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
    }),
  };
}