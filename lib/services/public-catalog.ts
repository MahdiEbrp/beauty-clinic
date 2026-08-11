import "server-only";

import { db } from "@/src/db";
import { serviceCategories, serviceGroups } from "@/src/db/schema";
import type {
  Locale,
  PublicCatalog,
  PublicCatalogEntry,
  ServiceGroupContent,
  TranslatedContent,
} from "./types";
import {
  emptyGroupContent,
  loadCategoryTranslations,
  loadGroupTranslations,
} from "./i18n";

/** Picks the requested locale from a pair of translations with a fallback. */
function pick(
  translations: TranslatedContent<ServiceGroupContent>,
  locale: Locale,
): ServiceGroupContent {
  const primary = locale === "en" ? translations.en : translations.fa;
  const secondary = locale === "en" ? translations.fa : translations.en;
  if (primary.name) return primary;
  if (secondary.name) return secondary;
  return primary;
}

/**
 * Localized service groups and categories for the public marketing site.
 *
 * Only `isActive` rows are exposed. Content resolves through the *_i18n tables
 * for the requested locale, falling back to the other locale when a name is
 * missing. Groups/categories are ordered by `displayOrder`, then id for a
 * stable tie-break.
 */
export async function getPublicCatalog(locale: Locale): Promise<PublicCatalog> {
  const [groupRows, categoryRows] = await Promise.all([
    db
      .select()
      .from(serviceGroups)
      .orderBy(serviceGroups.displayOrder, serviceGroups.id),
    db
      .select()
      .from(serviceCategories)
      .orderBy(serviceCategories.displayOrder, serviceCategories.id),
  ]);

  const groupTranslations = await loadGroupTranslations(groupRows.map((row) => row.id));
  const categoryTranslations = await loadCategoryTranslations(categoryRows.map((row) => row.id));

  const groups: PublicCatalogEntry[] = groupRows
    .filter((row) => row.isActive)
    .map((row) => {
      const content = pick(
        groupTranslations.get(row.id) ?? { fa: emptyGroupContent(), en: emptyGroupContent() },
        locale,
      );
      return {
        slug: row.slug,
        icon: row.icon,
        displayOrder: row.displayOrder,
        title: content.name,
        description: content.description,
      };
    });

  const categories: PublicCatalogEntry[] = categoryRows
    .filter((row) => row.isActive)
    .map((row) => {
      const content = pick(
        categoryTranslations.get(row.id) ?? { fa: emptyGroupContent(), en: emptyGroupContent() },
        locale,
      );
      return {
        slug: row.slug,
        icon: row.icon,
        displayOrder: row.displayOrder,
        title: content.name,
        description: content.description,
      };
    });

  return { groups, categories };
}