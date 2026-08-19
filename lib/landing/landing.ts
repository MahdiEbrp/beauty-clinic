import "server-only";

import { and, eq } from "drizzle-orm";
import { cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import {
  landingAboutStats,
  landingGalleryItems,
  landingHero,
  landingMarqueeItems,
  landingPages,
  landingSections,
  landingServices,
} from "@/src/db/schema";
import type { Locale, ServiceContent, TranslatedContent } from "@/lib/services/types";
import { getContentVersion, bumpContentVersion } from "@/lib/services/content-version";
import { loadServiceTranslations } from "@/lib/services/i18n";
import {
  emptyAboutStatContentSentinel,
  emptyGalleryContentSentinel,
  emptyHeroContentSentinel,
  emptyMarqueeContentSentinel,
  emptySectionContentSentinel,
  emptyServiceContentSentinel,
  emptyPagesContentSentinel,
} from "./empty";
import {
  loadLandingAboutStatsTranslations,
  loadLandingGalleryItemsTranslations,
  loadLandingHeroTranslations,
  loadLandingMarqueeTranslations,
  loadLandingPageTranslations,
  loadLandingSectionTranslations,
  loadLandingServicesTranslations,
} from "./i18n";
import type {
  LandingAboutStatContent,
  LandingGalleryItemContent,
  LandingHeroContent,
  LandingMarqueeItemContent,
  LandingPageContent,
  LandingSectionContent,
  LandingServiceContent,
  LandingTranslated,
} from "./content-types";
import type {
  PublicAboutStat,
  PublicGalleryItem,
  PublicHero,
  PublicLanding,
  PublicLandingService,
  PublicMarqueeItem,
  PublicSection,
} from "./types";

const LANDING_TTL_SECS = 7 * 24 * 60 * 60;
const CACHE_PREFIX = "landing";

function landingCacheKey(locale: Locale, version: number): string {
  return `${CACHE_PREFIX}:v${version}:${locale}`;
}

/** Pick the requested locale with a fallback to the other one when empty. */
function pick<T>(
  translations: LandingTranslated<T> | undefined,
  locale: Locale,
  isPresent: (content: T) => boolean,
): T | undefined {
  const primary = locale === "en" ? translations?.en : translations?.fa;
  const secondary = locale === "en" ? translations?.fa : translations?.en;
  if (primary && isPresent(primary)) return primary;
  if (secondary && isPresent(secondary)) return secondary;
  return primary ?? secondary;
}

const pagesIsPresent = (c: LandingPageContent) => Boolean(c.seoTitle || c.seoDescription);
const sectionIsPresent = (c: LandingSectionContent) => Boolean(c.heading);
const heroIsPresent = (c: LandingHeroContent) => Boolean(c.title);
const marqueeIsPresent = (c: LandingMarqueeItemContent) => Boolean(c.text);
const serviceIsPresent = (c: LandingServiceContent) => Boolean(c.title);
const statIsPresent = (c: LandingAboutStatContent) => Boolean(c.label);
const galleryIsPresent = (c: LandingGalleryItemContent) => Boolean(c.alt || c.caption);

function emptyLanding(): PublicLanding {
  return {
    seo: { title: null, description: null },
    hero: emptyHeroContentSentinel as PublicHero,
    marqueeItems: [],
    services: null,
    serviceCards: [],
    about: null,
    aboutStats: [],
    gallery: null,
    galleryItems: [],
    contact: null,
  };
}

/**
 * Fully localized landing-page content for the public site.
 *
 * Only `isActive` rows are exposed. Content resolves through the `*_i18n`
 * tables for the requested locale, falling back to the other locale when a
 * required field is missing. Sections are filtered on `isActive` and keyed by
 * their slug (`services`, `about`, `gallery`, `contact`); their child rows are
 * ordered by `displayOrder`, then id.
 *
 * Services-intro cards fall back to the linked catalog service's own title when
 * no marketing-copy override exists (`landing_services_i18n`).
 *
 * Loaded with sequential batched queries (one `inArray` per `*_i18n` table) to
 * stay within the pool/connection budget, then cached per-locale via the shared
 * content version so catalog/rules/landing invalidate atomically.
 */
export async function getPublicLanding(locale: Locale): Promise<PublicLanding> {
  const version = await getContentVersion();
  return cacheWrap(landingCacheKey(locale, version), LANDING_TTL_SECS, () =>
    loadLanding(locale),
  );
}

async function loadLanding(locale: Locale): Promise<PublicLanding> {
  const [page] = await db
    .select()
    .from(landingPages)
    .where(and(eq(landingPages.slug, "home"), eq(landingPages.isActive, true)))
    .limit(1);

  if (!page) return emptyLanding();
  const landing = { ...emptyLanding() };

  const pageTranslations = await loadLandingPageTranslations([page.id]);
  const seo = pick(pageTranslations.get(page.id), locale, pagesIsPresent) ?? emptyPagesContentSentinel;
  landing.seo = { title: seo.seoTitle ?? null, description: seo.seoDescription ?? null };

  // Hero (single row per page).
  const [heroRow] = await db
    .select()
    .from(landingHero)
    .where(eq(landingHero.landingPageId, page.id))
    .limit(1);
  if (heroRow) {
    const heroTranslations = await loadLandingHeroTranslations([heroRow.id]);
    const hero = pick(heroTranslations.get(heroRow.id), locale, heroIsPresent) ?? emptyHeroContentSentinel;
    landing.hero = {
      image: heroRow.image,
      taglineIcon: heroRow.taglineIcon,
      title: hero.title,
      tagline: hero.tagline ?? null,
      description: hero.description ?? null,
      ctaLabel1: hero.ctaLabel1,
      ctaLabel2: hero.ctaLabel2,
    };
  }

  // Marquee items.
  const marqueeRows = await db
    .select()
    .from(landingMarqueeItems)
    .where(and(eq(landingMarqueeItems.landingPageId, page.id), eq(landingMarqueeItems.isActive, true)))
    .orderBy(landingMarqueeItems.displayOrder, landingMarqueeItems.id);
  const marqueeTranslations = await loadLandingMarqueeTranslations(
    marqueeRows.map((row) => row.id),
  );
  landing.marqueeItems = marqueeRows.map((row): PublicMarqueeItem => {
    const content = pick(marqueeTranslations.get(row.id), locale, marqueeIsPresent) ?? emptyMarqueeContentSentinel;
    return { key: row.key, icon: row.icon, text: content.text };
  });

  // Sections, keyed by slug.
  const sectionRows = await db
    .select()
    .from(landingSections)
    .where(eq(landingSections.landingPageId, page.id))
    .orderBy(landingSections.displayOrder, landingSections.id);
  const sectionTranslations = await loadLandingSectionTranslations(
    sectionRows.map((row) => row.id),
  );
  const sectionByKey = new Map<string, (typeof landingSections.$inferSelect)>();
  for (const row of sectionRows) {
    if (row.isActive) sectionByKey.set(row.key, row);
  }

  const sectionContent = (row: (typeof landingSections.$inferSelect) | undefined): PublicSection | null => {
    if (!row) return null;
    const content = pick(sectionTranslations.get(row.id), locale, sectionIsPresent) ?? emptySectionContentSentinel;
    return { key: row.key, heading: content.heading, description: content.description ?? null };
  };

  landing.services = sectionContent(sectionByKey.get("services"));
  landing.about = sectionContent(sectionByKey.get("about"));
  landing.gallery = sectionContent(sectionByKey.get("gallery"));
  landing.contact = sectionContent(sectionByKey.get("contact"));

  // Services-intro cards under the services section, with catalog fallback.
  const servicesSection = sectionByKey.get("services");
  if (servicesSection) {
    const cardRows = await db
      .select()
      .from(landingServices)
      .where(and(eq(landingServices.sectionId, servicesSection.id), eq(landingServices.isActive, true)))
      .orderBy(landingServices.displayOrder, landingServices.id);
    const serviceOverride = await loadLandingServicesTranslations(cardRows.map((row) => row.id));
    const linkedServiceIds = cardRows
      .map((row) => row.serviceId)
      .filter((id): id is string => Boolean(id));
    const catalogTranslations: Map<string, TranslatedContent<ServiceContent>> =
      linkedServiceIds.length
        ? await loadServiceTranslations(linkedServiceIds)
        : new Map<string, TranslatedContent<ServiceContent>>();
    landing.serviceCards = cardRows.map((row): PublicLandingService => {
      const override = pick(serviceOverride.get(row.id), locale, serviceIsPresent) ?? emptyServiceContentSentinel;
      const catalog = row.serviceId ? catalogTranslations.get(row.serviceId) : undefined;
      const catalogContent = catalog ? (locale === "en" ? catalog.en : catalog.fa) : undefined;
      const title = override.title || catalogContent?.title || "";
      const description = override.description ?? catalogContent?.shortDesc ?? null;
      return {
        key: row.id,
        icon: row.icon,
        image: row.image,
        title,
        description,
        ctaLabel: override.ctaLabel ?? null,
        href: "/pricing",
      };
    });
  }

  // About stats under the about section.
  const aboutSection = sectionByKey.get("about");
  if (aboutSection) {
    const statRows = await db
      .select()
      .from(landingAboutStats)
      .where(and(eq(landingAboutStats.sectionId, aboutSection.id), eq(landingAboutStats.isActive, true)))
      .orderBy(landingAboutStats.displayOrder, landingAboutStats.id);
    const statTranslations = await loadLandingAboutStatsTranslations(statRows.map((row) => row.id));
    landing.aboutStats = statRows.map((row): PublicAboutStat => {
      const content = pick(statTranslations.get(row.id), locale, statIsPresent) ?? emptyAboutStatContentSentinel;
      return {
        key: row.key,
        value: row.value,
        compact: row.compact,
        plus: row.plus,
        label: content.label,
      };
    });
  }

  // Gallery items under the gallery section.
  const gallerySection = sectionByKey.get("gallery");
  if (gallerySection) {
    const galleryRows = await db
      .select()
      .from(landingGalleryItems)
      .where(and(eq(landingGalleryItems.sectionId, gallerySection.id), eq(landingGalleryItems.isActive, true)))
      .orderBy(landingGalleryItems.displayOrder, landingGalleryItems.id);
    const galleryTranslations = await loadLandingGalleryItemsTranslations(galleryRows.map((row) => row.id));
    landing.galleryItems = galleryRows.map((row): PublicGalleryItem => {
      const content = pick(galleryTranslations.get(row.id), locale, galleryIsPresent) ?? emptyGalleryContentSentinel;
      return { key: row.key, imageUrl: row.imageUrl, caption: content.caption ?? null, alt: content.alt };
    });
  }

  return landing;
}

/** Invalidate the cached landing content (shared version bump). */
export async function bustLandingCache(): Promise<void> {
  await bumpContentVersion();
}
