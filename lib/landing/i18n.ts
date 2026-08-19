import { inArray } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingAboutStatsI18n,
  landingGalleryItemsI18n,
  landingHeroI18n,
  landingMarqueeItemsI18n,
  landingPagesI18n,
  landingSectionsI18n,
  landingServicesI18n,
} from "@/src/db/schema";
import type {
  LandingHeroContent,
  LandingServiceContent,
  LandingSectionContent,
  LandingTranslated,
  LandingAboutStatContent,
  LandingGalleryItemContent,
  LandingMarqueeItemContent,
  LandingPageContent,
} from "./content-types";

function emptyPages(): LandingPageContent {
  return { seoTitle: null, seoDescription: null };
}

function emptySection(): LandingSectionContent {
  return { heading: "", description: null };
}

function emptyHero(): LandingHeroContent {
  return {
    title: "",
    tagline: null,
    description: null,
    ctaLabel1: "",
    ctaLabel2: "",
  };
}

function emptyMarquee(): LandingMarqueeItemContent {
  return { text: "" };
}

function emptyService(): LandingServiceContent {
  return { title: "", description: null, ctaLabel: null };
}

function emptyStat(): LandingAboutStatContent {
  return { label: "" };
}

function emptyGallery(): LandingGalleryItemContent {
  return { caption: null, alt: "" };
}

function init<T>(map: Map<string, LandingTranslated<T>>, ids: string[], empty: T): void {
  for (const id of ids) map.set(id, { fa: empty, en: empty });
}

export async function loadLandingPageTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingPageContent>>> {
  const map = new Map<string, LandingTranslated<LandingPageContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptyPages());
  const rows = await db
    .select()
    .from(landingPagesI18n)
    .where(inArray(landingPagesI18n.landingPageId, ids));
  for (const row of rows) {
    const entry = map.get(row.landingPageId);
    if (!entry) continue;
    entry[row.locale] = { seoTitle: row.seoTitle, seoDescription: row.seoDescription };
  }
  return map;
}

export async function loadLandingSectionTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingSectionContent>>> {
  const map = new Map<string, LandingTranslated<LandingSectionContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptySection());
  const rows = await db
    .select()
    .from(landingSectionsI18n)
    .where(inArray(landingSectionsI18n.sectionId, ids));
  for (const row of rows) {
    const entry = map.get(row.sectionId);
    if (!entry) continue;
    entry[row.locale] = { heading: row.heading, description: row.description };
  }
  return map;
}

export async function loadLandingHeroTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingHeroContent>>> {
  const map = new Map<string, LandingTranslated<LandingHeroContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptyHero());
  const rows = await db
    .select()
    .from(landingHeroI18n)
    .where(inArray(landingHeroI18n.heroId, ids));
  for (const row of rows) {
    const entry = map.get(row.heroId);
    if (!entry) continue;
    entry[row.locale] = {
      title: row.title,
      tagline: row.tagline,
      description: row.description,
      ctaLabel1: row.ctaLabel1,
      ctaLabel2: row.ctaLabel2,
    };
  }
  return map;
}

export async function loadLandingMarqueeTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingMarqueeItemContent>>> {
  const map = new Map<string, LandingTranslated<LandingMarqueeItemContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptyMarquee());
  const rows = await db
    .select()
    .from(landingMarqueeItemsI18n)
    .where(inArray(landingMarqueeItemsI18n.marqueeItemId, ids));
  for (const row of rows) {
    const entry = map.get(row.marqueeItemId);
    if (!entry) continue;
    entry[row.locale] = { text: row.text };
  }
  return map;
}

export async function loadLandingServicesTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingServiceContent>>> {
  const map = new Map<string, LandingTranslated<LandingServiceContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptyService());
  const rows = await db
    .select()
    .from(landingServicesI18n)
    .where(inArray(landingServicesI18n.landingServiceId, ids));
  for (const row of rows) {
    const entry = map.get(row.landingServiceId);
    if (!entry) continue;
    entry[row.locale] = {
      title: row.title,
      description: row.description,
      ctaLabel: row.ctaLabel,
    };
  }
  return map;
}

export async function loadLandingAboutStatsTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingAboutStatContent>>> {
  const map = new Map<string, LandingTranslated<LandingAboutStatContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptyStat());
  const rows = await db
    .select()
    .from(landingAboutStatsI18n)
    .where(inArray(landingAboutStatsI18n.statId, ids));
  for (const row of rows) {
    const entry = map.get(row.statId);
    if (!entry) continue;
    entry[row.locale] = { label: row.label };
  }
  return map;
}

export async function loadLandingGalleryItemsTranslations(
  ids: string[],
): Promise<Map<string, LandingTranslated<LandingGalleryItemContent>>> {
  const map = new Map<string, LandingTranslated<LandingGalleryItemContent>>();
  if (ids.length === 0) return map;
  init(map, ids, emptyGallery());
  const rows = await db
    .select()
    .from(landingGalleryItemsI18n)
    .where(inArray(landingGalleryItemsI18n.galleryItemId, ids));
  for (const row of rows) {
    const entry = map.get(row.galleryItemId);
    if (!entry) continue;
    entry[row.locale] = { caption: row.caption, alt: row.alt };
  }
  return map;
}
