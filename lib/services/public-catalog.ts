import "server-only";

import { cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import { serviceCategories, serviceGroups } from "@/src/db/schema";
import { bumpContentVersion, getContentVersion } from "./content-version";
import { notifyIndexNow } from "@/lib/indexnow";
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
const CATALOG_TTL_SECS = 7 * 24 * 60 * 60;

const CACHE_PREFIX = "catalog";

function catalogCacheKey(locale: Locale, version: number): string {
  return `${CACHE_PREFIX}:v${version}:${locale}`;
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
  const version = await getContentVersion();
  return cacheWrap(catalogCacheKey(locale, version), CATALOG_TTL_SECS, () => loadCatalog(locale));
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
 * Invalidate all versioned public content caches (rules, catalog, tree).
 * Called after any create/update/delete of a service group or category so the
 * public feed reflects the change immediately instead of waiting out the TTL.
 * The single version bump covers both the catalog and the derived service tree
 * in one atomic step.
 *
 * Also announces the change to Bing and the other IndexNow engines. The default
 * notification is the catalog index rather than the specific group/category
 * page: these callers only ever load `{ id }` before mutating, so resolving the
 * affected slug would cost an extra query per admin edit against a 5-connection
 * pool. The daily sitemap sweep in instrumentation.ts covers the deep URLs
 * within 24h, and pass an explicit `paths` list whenever the slug is known.
 */
export async function bustPublicCatalogCache(
  paths?: readonly string[],
): Promise<void> {
  await bumpContentVersion();
  await notifyIndexNow(paths ?? ["/services"], { source: "catalog" });
}
