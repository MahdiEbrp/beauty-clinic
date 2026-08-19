import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  landingAboutStats,
  landingAboutStatsI18n,
  landingGalleryItems,
  landingGalleryItemsI18n,
  landingHero,
  landingHeroI18n,
  landingMarqueeItems,
  landingMarqueeItemsI18n,
  landingPages,
  landingPagesI18n,
  landingSections,
  landingSectionsI18n,
  landingServices,
  landingServicesI18n,
  services,
} from "../schema";
import {
  LANDING_HERO_I18N,
  LANDING_MARQUEE,
  LANDING_PAGE_I18N,
  LANDING_SECTIONS,
} from "./landing-content";
import type { SeedSection } from "./landing-content";
import type { Locale } from "@/lib/services/types";

const HOME_SLUG = "home";
const LOCALES: Locale[] = ["en", "fa"];

/** Collapse a `Localized<T>` map into locale/content pairs (fixed 2 keys). */
function forLocale<T>(map: Record<Locale, T>): Array<{ locale: Locale; content: T }> {
  return LOCALES.map((locale) => ({
    locale,

    content: map[locale],
  }));
}

/**
 * Seeds the landing page content from LANDING_* constants.
 *
 * Idempotent upsert — landing rows are matched by their stable natural keys
 * (page slug, section key, marquee/stat/gallery key, linked service slug).
 * Existing rows are never deleted, so admin-created content survives re-runs.
 */
export async function seedLanding(): Promise<void> {
  const [page] = await db
    .insert(landingPages)
    .values({ slug: HOME_SLUG, isActive: true })
    .onConflictDoUpdate({
      target: landingPages.slug,
      set: { isActive: true },
    })
    .returning({ id: landingPages.id });

  for (const { locale, content } of forLocale(LANDING_PAGE_I18N)) {
    await db
      .insert(landingPagesI18n)
      .values({
        landingPageId: page.id,
        locale,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
      })
      .onConflictDoUpdate({
        target: [landingPagesI18n.landingPageId, landingPagesI18n.locale],
        set: { seoTitle: content.seoTitle, seoDescription: content.seoDescription },
      });
  }

  await seedHero(page.id);
  await seedMarquee(page.id);
  await seedSections(page.id);

  console.log("Landing page seeded.");
}

async function seedHero(landingPageId: string): Promise<void> {
  const [hero] = await db
    .insert(landingHero)
    .values({ landingPageId, image: LANDING_HERO_I18N.image, taglineIcon: LANDING_HERO_I18N.taglineIcon })
    .onConflictDoUpdate({
      target: landingHero.landingPageId,
      set: { image: LANDING_HERO_I18N.image, taglineIcon: LANDING_HERO_I18N.taglineIcon },
    })
    .returning({ id: landingHero.id });

  for (const { locale, content } of forLocale(LANDING_HERO_I18N.i18n)) {
    await db
      .insert(landingHeroI18n)
      .values({
        heroId: hero.id,
        locale,
        title: content.title,
        tagline: content.tagline,
        description: content.description,
        ctaLabel1: content.ctaLabel1,
        ctaLabel2: content.ctaLabel2,
      })
      .onConflictDoUpdate({
        target: [landingHeroI18n.heroId, landingHeroI18n.locale],
        set: {
          title: content.title,
          tagline: content.tagline,
          description: content.description,
          ctaLabel1: content.ctaLabel1,
          ctaLabel2: content.ctaLabel2,
        },
      });
  }
}

async function seedMarquee(landingPageId: string): Promise<void> {
  for (const [index, item] of LANDING_MARQUEE.entries()) {
    const [row] = await db
      .insert(landingMarqueeItems)
      .values({ landingPageId, key: `marquee-${index}`, icon: item.icon, displayOrder: index, isActive: true })
      .onConflictDoUpdate({
        target: [landingMarqueeItems.landingPageId, landingMarqueeItems.key],
        set: { icon: item.icon, displayOrder: index, isActive: true },
      })
      .returning({ id: landingMarqueeItems.id });

    for (const { locale, content } of forLocale(item.i18n)) {
      await db
        .insert(landingMarqueeItemsI18n)
        .values({ marqueeItemId: row.id, locale, text: content.text })
        .onConflictDoUpdate({
          target: [landingMarqueeItemsI18n.marqueeItemId, landingMarqueeItemsI18n.locale],
          set: { text: content.text },
        });
    }
  }
}

async function seedSections(landingPageId: string): Promise<void> {
  for (const [sIndex, section] of LANDING_SECTIONS.entries()) {
    const [row] = await db
      .insert(landingSections)
      .values({ landingPageId, key: section.key, displayOrder: sIndex, isActive: true })
      .onConflictDoUpdate({
        target: [landingSections.landingPageId, landingSections.key],
        set: { displayOrder: sIndex, isActive: true },
      })
      .returning({ id: landingSections.id });

    for (const { locale, content } of forLocale(section.i18n)) {
      await db
        .insert(landingSectionsI18n)
        .values({ sectionId: row.id, locale, heading: content.heading, description: content.description })
        .onConflictDoUpdate({
          target: [landingSectionsI18n.sectionId, landingSectionsI18n.locale],
          set: { heading: content.heading, description: content.description },
        });
    }

    await seedServiceCards(row.id, section);
    await seedStats(row.id, section);
    await seedGallery(row.id, section);
  }
}

async function seedServiceCards(sectionId: string, section: SeedSection): Promise<void> {
  if (!section.services) return;
  for (const [index, card] of section.services.entries()) {
    const [service] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, card.slug))
      .limit(1);

    const [row] = await db
      .insert(landingServices)
      .values({
        sectionId,
        key: `card-${card.slug}`,
        serviceId: service ? service.id : null,
        icon: card.icon,
        image: card.image,
        displayOrder: index,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [landingServices.sectionId, landingServices.key],
        set: {
          serviceId: service ? service.id : null,
          icon: card.icon,
          image: card.image,
          displayOrder: index,
          isActive: true,
        },
      })
      .returning({ id: landingServices.id });

    for (const { locale, content } of forLocale(card.i18n)) {
      await db
        .insert(landingServicesI18n)
        .values({
          landingServiceId: row.id,
          locale,
          title: content.title,
          description: content.description,
          ctaLabel: content.ctaLabel,
        })
        .onConflictDoUpdate({
          target: [landingServicesI18n.landingServiceId, landingServicesI18n.locale],
          set: {
            title: content.title,
            description: content.description,
            ctaLabel: content.ctaLabel,
          },
        });
    }
  }
}

async function seedStats(sectionId: string, section: SeedSection): Promise<void> {
  if (!section.stats) return;
  for (const [index, stat] of section.stats.entries()) {
    const key = `stat-${index}`;
    const [row] = await db
      .insert(landingAboutStats)
      .values({
        sectionId,
        key,
        value: stat.value,
        compact: stat.compact,
        plus: stat.plus,
        displayOrder: index,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [landingAboutStats.sectionId, landingAboutStats.key],
        set: { value: stat.value, compact: stat.compact, plus: stat.plus, displayOrder: index, isActive: true },
      })
      .returning({ id: landingAboutStats.id });

    for (const { locale, content } of forLocale(stat.i18n)) {
      await db
        .insert(landingAboutStatsI18n)
        .values({ statId: row.id, locale, label: content.label })
        .onConflictDoUpdate({
          target: [landingAboutStatsI18n.statId, landingAboutStatsI18n.locale],
          set: { label: content.label },
        });
    }
  }
}

async function seedGallery(sectionId: string, section: SeedSection): Promise<void> {
  if (!section.galleryItems) return;
  for (const [index, item] of section.galleryItems.entries()) {
    const key = `gallery-${index}`;
    const [row] = await db
      .insert(landingGalleryItems)
      .values({ sectionId, key, imageUrl: item.imageUrl, displayOrder: index, isActive: true })
      .onConflictDoUpdate({
        target: [landingGalleryItems.sectionId, landingGalleryItems.key],
        set: { imageUrl: item.imageUrl, displayOrder: index, isActive: true },
      })
      .returning({ id: landingGalleryItems.id });

    for (const { locale, content } of forLocale(item.i18n)) {
      await db
        .insert(landingGalleryItemsI18n)
        .values({ galleryItemId: row.id, locale, caption: content.caption, alt: content.alt })
        .onConflictDoUpdate({
          target: [landingGalleryItemsI18n.galleryItemId, landingGalleryItemsI18n.locale],
          set: { caption: content.caption, alt: content.alt },
        });
    }
  }
}
