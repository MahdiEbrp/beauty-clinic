import { count, eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from "@/lib/validation/services";
import { db } from "@/src/db";
import {
  serviceCategories,
  serviceCategoriesI18n,
  serviceGroups,
  services,
} from "@/src/db/schema";
import { bustPublicCatalogCache } from "./public-catalog";
import { assertGroupExists, assertSlugAvailable, isUniqueViolation, mapCategoryRow, uniqueSlugError } from "./helpers";
import {
  emptyGroupContent,
  loadCategoryTranslations,
  loadGroupTranslations,
  upsertCategoryTranslation,
} from "./i18n";
import type { AdminServiceCategory, Locale, ServiceCategoryContent } from "./types";

export async function listCategories(): Promise<AdminServiceCategory[]> {
  const rows = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.displayOrder, serviceCategories.createdAt);
  const categoryTr = await loadCategoryTranslations(rows.map((row) => row.id));

  const [serviceRowsPerCategory, groupRows] = await Promise.all([
    db.select({ categoryId: services.categoryId }).from(services),
    db.select({ id: serviceGroups.id }).from(serviceGroups),
  ]);
  const groupTr = await loadGroupTranslations(groupRows.map((row) => row.id));

  const serviceCounts = new Map<string, number>();
  for (const row of serviceRowsPerCategory) {
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

export async function getCategory(id: string): Promise<AdminServiceCategory> {
  const row = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
  });
  if (!row) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Service category not found.");

  const [countRow, groupTr] = await Promise.all([
    db.select({ value: count() }).from(services).where(eq(services.categoryId, id)),
    loadGroupTranslations([row.groupId]),
  ]);
  const tr = (await loadCategoryTranslations([id])).get(id) ?? {
    fa: emptyGroupContent(),
    en: emptyGroupContent(),
  };

  return mapCategoryRow(
    row,
    tr,
    groupTr.get(row.groupId)?.fa.name ?? "",
    countRow[0]?.value ?? 0,
  );
}

export async function createCategory(
  input: CreateServiceCategoryInput,
): Promise<{ id: string }> {
  await assertGroupExists(input.groupId);

  try {
    const result = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(serviceCategories)
        .values({
          groupId: input.groupId,
          slug: input.slug,
          icon: input.icon ?? null,
          image: input.image ?? null,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
        })
        .returning({ id: serviceCategories.id });
      if (!row) {
        throw new ApiError(500, "CATEGORY_CREATE_FAILED", "Could not create service category.");
      }

      const translations = input.translations;
      await tx.insert(serviceCategoriesI18n).values([
        {
          categoryId: row.id,
          locale: "fa",
          name: translations.fa.name,
          description: translations.fa.description ?? null,
          seoTitle: translations.fa.seoTitle ?? null,
          seoDescription: translations.fa.seoDescription ?? null,
        },
        {
          categoryId: row.id,
          locale: "en",
          name: translations.en.name,
          description: translations.en.description ?? null,
          seoTitle: translations.en.seoTitle ?? null,
          seoDescription: translations.en.seoDescription ?? null,
        },
      ]);

      return { id: row.id };
    });

    // Invalidate the cached public feed so the new category shows up now.
    await bustPublicCatalogCache();
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("category");
    throw error;
  }
}

export async function updateCategory(
  id: string,
  input: UpdateServiceCategoryInput,
): Promise<void> {
  const existing = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CATEGORY_NOT_FOUND", "Service category not found.");
  }

  if (input.groupId !== undefined) {
    await assertGroupExists(input.groupId);
  }
  if (input.slug !== undefined) {
    await assertSlugAvailable("service_categories", input.slug, id);
  }

  try {
    await db.transaction(async (tx) => {
      const { translations, ...rest } = input;
      if (Object.keys(rest).length > 0) {
        await tx.update(serviceCategories).set(rest).where(eq(serviceCategories.id, id));
      }
      if (translations) {
        const entries = Object.entries(translations) as [Locale, Partial<ServiceCategoryContent>][];
        for (const [locale, content] of entries) {
          if (!content) continue;
          await upsertCategoryTranslation(tx, id, locale, content);
        }
      }
    });

    // Invalidate the cached public feed so the edits are reflected now.
    await bustPublicCatalogCache();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("category");
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CATEGORY_NOT_FOUND", "Service category not found.");
  }

  await db.delete(serviceCategories).where(eq(serviceCategories.id, id));

  // Invalidate the cached public feed so the removed category disappears now.
  await bustPublicCatalogCache();
}