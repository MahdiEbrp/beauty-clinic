import "server-only";

import { and, asc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import {
  serviceCategories,
  serviceCategoriesI18n,
  serviceGroups,
  serviceGroupsI18n,
  services,
  servicesI18n,
} from "@/src/db/schema";
import { getContentVersion } from "./content-version";
import type { Locale, PublicNavCatalog } from "./types";

/**
 * Lightweight nav tree (group -> category -> service *names* only) powering
 * the public navbar's mega menu and mobile drawer accordion.
 *
 * Deliberately separate from `getPublicCatalog`/`PublicServiceTree`: it selects
 * only slug/title columns and skips price, images, faqs, and cover images, so
 * the navbar (which renders on every public page) never pays for data it does
 * not show. Only active groups/categories/services are included, ordered by
 * each level's `displayOrder`.
 *
 * Names resolve through the *_i18n tables joined once per level (fa/en), with
 * the same primary-or-other-locale fallback the rest of the public site uses,
 * so partially translated entries never vanish from the menu.
 *
 * Cached per-locale under the shared content version — `bustPublicCatalogCache()`
 * (called after any catalog mutation) invalidates this feed too.
 */

/** TTL for the cached public nav feed (seconds). */
const NAV_CATALOG_TTL_SECS = 7 * 24 * 60 * 60;

const CACHE_PREFIX = "nav-catalog";

// One alias per i18n table/locale so both locales' names arrive in a single query.
const groupsI18nFa = alias(serviceGroupsI18n, "groups_i18n_fa");
const groupsI18nEn = alias(serviceGroupsI18n, "groups_i18n_en");
const categoriesI18nFa = alias(serviceCategoriesI18n, "categories_i18n_fa");
const categoriesI18nEn = alias(serviceCategoriesI18n, "categories_i18n_en");
const servicesI18nFa = alias(servicesI18n, "services_i18n_fa");
const servicesI18nEn = alias(servicesI18n, "services_i18n_en");

/** Primary locale's title (skipping empty strings), falling back to the other locale. */
function pickName(
  primary: AnyPgColumn,
  secondary: AnyPgColumn,
  locale: Locale,
): SQL<string> {
  const [first, second] = locale === "fa" ? [primary, secondary] : [secondary, primary];
  return sql<string>`coalesce(nullif(${first}, ''), ${second}, '')`;
}

export async function getPublicNavCatalog(locale: Locale): Promise<PublicNavCatalog> {
  const version = await getContentVersion();
  return cacheWrap(
    `${CACHE_PREFIX}:v${version}:${locale}`,
    NAV_CATALOG_TTL_SECS,
    () => loadNavCatalog(locale),
  );
}

async function loadNavCatalog(locale: Locale): Promise<PublicNavCatalog> {
  const rows = await db
    .select({
      groupId: serviceGroups.id,
      groupSlug: serviceGroups.slug,
      groupIcon: serviceGroups.icon,
      groupDisplayOrder: serviceGroups.displayOrder,
      groupName: pickName(groupsI18nFa.name, groupsI18nEn.name, locale),

      categoryId: serviceCategories.id,
      categorySlug: serviceCategories.slug,
      categoryDisplayOrder: serviceCategories.displayOrder,
      categoryName: pickName(categoriesI18nFa.name, categoriesI18nEn.name, locale),

      serviceId: services.id,
      serviceSlug: services.slug,
      serviceDisplayOrder: services.displayOrder,
      serviceTitle: pickName(servicesI18nFa.title, servicesI18nEn.title, locale),
    })
    .from(serviceGroups)
    .innerJoin(
      serviceCategories,
      and(eq(serviceCategories.groupId, serviceGroups.id), eq(serviceCategories.isActive, true)),
    )
    .innerJoin(services, and(eq(services.categoryId, serviceCategories.id), eq(services.isActive, true)))
    .leftJoin(groupsI18nFa, and(eq(groupsI18nFa.groupId, serviceGroups.id), eq(groupsI18nFa.locale, "fa")))
    .leftJoin(groupsI18nEn, and(eq(groupsI18nEn.groupId, serviceGroups.id), eq(groupsI18nEn.locale, "en")))
    .leftJoin(categoriesI18nFa, and(eq(categoriesI18nFa.categoryId, serviceCategories.id), eq(categoriesI18nFa.locale, "fa")))
    .leftJoin(categoriesI18nEn, and(eq(categoriesI18nEn.categoryId, serviceCategories.id), eq(categoriesI18nEn.locale, "en")))
    .leftJoin(servicesI18nFa, and(eq(servicesI18nFa.serviceId, services.id), eq(servicesI18nFa.locale, "fa")))
    .leftJoin(servicesI18nEn, and(eq(servicesI18nEn.serviceId, services.id), eq(servicesI18nEn.locale, "en")))
    .where(eq(serviceGroups.isActive, true))
    .orderBy(
      asc(serviceGroups.displayOrder),
      asc(serviceGroups.id),
      asc(serviceCategories.displayOrder),
      asc(serviceCategories.id),
      asc(services.displayOrder),
      asc(services.id),
    );

  // Fold the flat row list into the nested group -> category -> service tree.
  // Maps keyed by id keep this a single pass over `rows`.
  const groupMap = new Map<
    string,
    {
      slug: string;
      icon: string | null;
      title: string;
      order: number;
      categoryMap: Map<
        string,
        {
          slug: string;
          title: string;
          order: number;
          services: { slug: string; title: string; order: number }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    let group = groupMap.get(row.groupId);
    if (!group) {
      group = {
        slug: row.groupSlug,
        icon: row.groupIcon,
        title: row.groupName,
        order: row.groupDisplayOrder,
        categoryMap: new Map(),
      };
      groupMap.set(row.groupId, group);
    }

    let category = group.categoryMap.get(row.categoryId);
    if (!category) {
      category = {
        slug: row.categorySlug,
        title: row.categoryName,
        order: row.categoryDisplayOrder,
        services: [],
      };
      group.categoryMap.set(row.categoryId, category);
    }

    category.services.push({
      slug: row.serviceSlug,
      title: row.serviceTitle,
      order: row.serviceDisplayOrder,
    });
  }

  const groups = Array.from(groupMap.values())
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      slug: group.slug,
      icon: group.icon,
      title: group.title,
      categories: Array.from(group.categoryMap.values())
        .sort((a, b) => a.order - b.order)
        .map((category) => ({
          slug: category.slug,
          title: category.title,
          services: category.services
            .sort((a, b) => a.order - b.order)
            .map((service) => ({ slug: service.slug, title: service.title })),
        })),
    }));

  return { groups };
}
