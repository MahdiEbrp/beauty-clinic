import "server-only";

import { and, count, eq, sql, type SQL } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingAboutStats,
  landingGalleryItems,
  landingHero,
  landingMarqueeItems,
  landingPages,
  landingPagesI18n,
  landingSections,
  landingServices,
} from "@/src/db/schema";
import { ApiError } from "@/lib/api/errors";
import {
  loadLandingAboutStatsTranslations,
  loadLandingGalleryItemsTranslations,
  loadLandingHeroTranslations,
  loadLandingMarqueeTranslations,
  loadLandingSectionTranslations,
  loadLandingServicesTranslations,
} from "../i18n";
import {
  mapAboutStat,
  mapGalleryItem,
  mapHero,
  mapLandingSeo,
  mapLandingSection,
  mapMarqueeItem,
  mapServiceCard,
} from "./map";
import type {
  AdminAboutStat,
  AdminCollectionRow,
  AdminGalleryItem,
  AdminHero,
  AdminLandingSection,
  AdminLandingSettings,
  AdminMarqueeItem,
  AdminServiceCard,
  LandingAdminOverview,
  LandingCollectionKey,
  LandingListResult,
} from "./types";

export type StatusFilter = "all" | "active" | "inactive";
export type ListCollectionOptions = {
  page: number;
  perPage: number;
  search?: string;
  status?: StatusFilter;
};

async function findHomePageId(): Promise<string> {
  const [page] = await db
    .select({ id: landingPages.id })
    .from(landingPages)
    .where(eq(landingPages.slug, "home"))
    .limit(1);
  if (!page) throw new ApiError(404, "LANDING_NOT_FOUND", "Landing page not found.");
  return page.id;
}

export async function getLandingAdminOverview(): Promise<LandingAdminOverview> {
  const [home] = await db
    .select({ id: landingPages.id, isActive: landingPages.isActive })
    .from(landingPages)
    .where(eq(landingPages.slug, "home"))
    .limit(1);

  if (!home) {
    return {
      active: 0,
      sections: 0,
      marquee: 0,
      services: 0,
      stats: 0,
      gallery: 0,
      hasPages: false,
    };
  }

  const sections = await db
    .select({ value: count() })
    .from(landingSections)
    .where(eq(landingSections.landingPageId, home.id));
  const marquee = await db
    .select({ value: count() })
    .from(landingMarqueeItems)
    .where(eq(landingMarqueeItems.landingPageId, home.id));
  const servicesCount = await db.select({ value: count() }).from(landingServices);
  const stats = await db.select({ value: count() }).from(landingAboutStats);
  const gallery = await db.select({ value: count() }).from(landingGalleryItems);

  return {
    active: home.isActive ? 1 : 0,
    sections: sections[0]?.value ?? 0,
    marquee: marquee[0]?.value ?? 0,
    services: servicesCount[0]?.value ?? 0,
    stats: stats[0]?.value ?? 0,
    gallery: gallery[0]?.value ?? 0,
    hasPages: true,
  };
}

// --- Collections -----------------------------------------------------------

function searchCondition(key: LandingCollectionKey, term: string): SQL | undefined {
  const like = `%${term}%`;
  if (key === "marquee") {
    return sql`exists (select 1 from landing_marquee_items_i18n i
      where i.marquee_item_id = ${landingMarqueeItems.id} and i.text ilike ${like})`;
  }
  if (key === "services") {
    return sql`exists (select 1 from landing_services_i18n i
      where i.landing_service_id = ${landingServices.id} and (i.title ilike ${like}
      or i.description ilike ${like}))`;
  }
  if (key === "stats") {
    return sql`exists (select 1 from landing_about_stats_i18n i
      where i.stat_id = ${landingAboutStats.id} and i.label ilike ${like})`;
  }
  return sql`exists (select 1 from landing_gallery_items_i18n i
    where i.gallery_item_id = ${landingGalleryItems.id} and (i.alt ilike ${like}
    or i.caption ilike ${like}))`;
}

export async function listCollectionRows(
  key: LandingCollectionKey,
  opts: ListCollectionOptions,
): Promise<LandingListResult<AdminCollectionRow>> {
  const { page, perPage, search = "", status = "all" } = opts;
  const offset = (page - 1) * perPage;

  const conditions: SQL[] = [];
  if (search) {
    const sc = searchCondition(key, search.trim());
    if (sc) conditions.push(sc);
  }
  if (status === "active") conditions.push(eq(activeColumn(key), true));
  else if (status === "inactive") conditions.push(eq(activeColumn(key), false));

  const where = conditions.length ? and(...conditions) : undefined;
  const table = collectionTable(key);

  const [totalRow, rows] = await Promise.all([
    db.select({ value: count() }).from(table).where(where),
    db
      .select()
      .from(table)
      .where(where)
      .orderBy(table.displayOrder)
      .limit(perPage)
      .offset(offset),
  ]);

  return {
    items: await collectRows(key, rows),
    total: totalRow[0]?.value ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((totalRow[0]?.value ?? 0) / perPage),
  };
}

function collectionTable(key: LandingCollectionKey) {
  return key === "marquee"
    ? landingMarqueeItems
    : key === "services"
      ? landingServices
      : key === "stats"
        ? landingAboutStats
        : landingGalleryItems;
}

function activeColumn(key: LandingCollectionKey) {
  const table = collectionTable(key);
  return table.isActive;
}

async function collectRows(
  key: LandingCollectionKey,
  rows: unknown[],
): Promise<AdminCollectionRow[]> {
  if (rows.length === 0) return [];

  if (key === "marquee") {
    const typed = rows as (typeof landingMarqueeItems.$inferSelect)[];
    const tr = await loadLandingMarqueeTranslations(typed.map((r) => r.id));
    return typed.map((r) => mapMarqueeItem(r, tr.get(r.id)));
  }

  if (key === "services") {
    const typed = rows as (typeof landingServices.$inferSelect)[];
    const tr = await loadLandingServicesTranslations(typed.map((r) => r.id));
    return typed.map((r) => mapServiceCard(r, tr.get(r.id)));
  }

  if (key === "stats") {
    const typed = rows as (typeof landingAboutStats.$inferSelect)[];
    const tr = await loadLandingAboutStatsTranslations(typed.map((r) => r.id));
    return typed.map((r) => mapAboutStat(r, tr.get(r.id)));
  }

  const typed = rows as (typeof landingGalleryItems.$inferSelect)[];
  const tr = await loadLandingGalleryItemsTranslations(typed.map((r) => r.id));
  return typed.map((r) => mapGalleryItem(r, tr.get(r.id)));
}

export async function getCollectionRow(
  key: LandingCollectionKey,
  id: string,
): Promise<AdminCollectionRow> {
  const table = collectionTable(key);
  const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!row) throw new ApiError(404, "LANDING_ROW_NOT_FOUND", "Landing row not found.");
  return (await collectRows(key, [row]))[0];
}

export async function findCollectionIds(
  key: LandingCollectionKey,
  filters: { search?: string; status?: StatusFilter },
): Promise<string[]> {
  const conditions: SQL[] = [];
  if (filters.search) {
    const sc = searchCondition(key, filters.search.trim());
    if (sc) conditions.push(sc);
  }
  if (filters.status === "active") conditions.push(eq(activeColumn(key), true));
  else if (filters.status === "inactive") conditions.push(eq(activeColumn(key), false));

  const where = conditions.length ? and(...conditions) : undefined;
  const table = collectionTable(key);
  const rows = await db.select({ id: table.id }).from(table).where(where);
  return rows.map((r) => r.id);
}

export async function getLandingHero(): Promise<AdminHero | null> {
  const pageId = await findHomePageId();
  const [hero] = await db
    .select()
    .from(landingHero)
    .where(eq(landingHero.landingPageId, pageId))
    .limit(1);
  if (!hero) return null;
  const tr = await loadLandingHeroTranslations([hero.id]);
  return mapHero(hero, tr.get(hero.id));
}

export async function getLandingSettings(): Promise<AdminLandingSettings> {
  const pageId = await findHomePageId();

  const [seoRows, sectionRows] = await Promise.all([
    db
      .select()
      .from(landingPagesI18n)
      .where(eq(landingPagesI18n.landingPageId, pageId)),
    db
      .select()
      .from(landingSections)
      .where(eq(landingSections.landingPageId, pageId))
      .orderBy(landingSections.displayOrder),
  ]);

  const seo = mapLandingSeo(seoRows);
  const tr = await loadLandingSectionTranslations(sectionRows.map((r) => r.id));
  const sections: AdminLandingSection[] = [];
  for (const row of sectionRows) {
    const s = mapLandingSection(row, tr.get(row.id));
    if (s) sections.push(s);
  }

  return { seo, sections };
}

export type {
  AdminMarqueeItem,
  AdminServiceCard,
  AdminAboutStat,
  AdminGalleryItem,
  AdminHero,
  AdminLandingSettings,
  AdminLandingSection,
  LandingCollectionKey,
  LandingListResult,
};
