import "server-only";

import { cacheWrap, cacheDel } from "@/lib/cache";
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

/** TTL for the cached public catalog feed (seconds). */
const CATALOG_TTL_SECS = 60;

const CACHE_PREFIX = "catalog";
const CATALOG_LOCALES: Locale[] = ["fa", "en"];

function catalogCacheKey(locale: Locale): string {
  return `${CACHE_PREFIX}:${locale}`;
}

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
 *
 * The result is cached per-locale for CATALOG_TTL_SECS so repeat visits (and
 * concurrent requests) hit the shared cache instead of Postgres. Mutations in
 * the service catalog call `bustPublicCatalogCache()` to invalidate it.
 */
export async function getPublicCatalog(locale: Locale): Promise<PublicCatalog> {
  return cacheWrap(catalogCacheKey(locale), CATALOG_TTL_SECS, () => loadCatalog(locale));
}

async function loadCatalog(locale: Locale): Promise<PublicCatalog> {
  // Phase 1: fetch rows in parallel.
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

  // Phase 2: fetch i18n rows in parallel (single inArray query each).
  const [groupTranslations, categoryTranslations] = await Promise.all([
    loadGroupTranslations(groupRows.map((row) => row.id)),
    loadCategoryTranslations(categoryRows.map((row) => row.id)),
  ]);

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

/**
 * Drop all cached catalog variants. Called after any create/update/delete of a
 * service group or category so the public feed reflects the change immediately
 * instead of waiting out the TTL.
 */
export async function bustPublicCatalogCache(): Promise<void> {
  await Promise.all(CATALOG_LOCALES.map((locale) => cacheDel(catalogCacheKey(locale))));
}
