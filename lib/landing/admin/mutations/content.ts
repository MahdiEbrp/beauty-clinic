import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingHero,
  landingHeroI18n,
  landingPagesI18n,
  landingSections,
  landingSectionsI18n,
} from "@/src/db/schema";
import { ApiError } from "@/lib/api/errors";
import { bustLandingCache } from "../../landing";
import type { TranslatedContent } from "@/lib/services/types";
import { eachLocale, findHomePageId } from "./helpers";

// --- Hero ------------------------------------------------------------------

export type HeroDraft = {
  image?: string | null;
  taglineIcon?: string | null;
  translations?: TranslatedContent<{
    title: string;
    tagline?: string | null;
    description?: string | null;
    ctaLabel1: string;
    ctaLabel2: string;
  }>;
};

export async function updateHero(draft: HeroDraft): Promise<void> {
  const pageId = await findHomePageId();
  const [hero] = await db
    .select()
    .from(landingHero)
    .where(eq(landingHero.landingPageId, pageId))
    .limit(1);
  if (!hero) throw new ApiError(404, "LANDING_HERO_NOT_FOUND", "Landing hero not found.");
  await db
    .update(landingHero)
    .set({ image: draft.image, taglineIcon: draft.taglineIcon })
    .where(eq(landingHero.id, hero.id));
  if (draft.translations) {
    const translations = draft.translations;
    await eachLocale((l) => {
      const c = translations[l];
      return db
        .insert(landingHeroI18n)
        .values({
          heroId: hero.id,
          locale: l,
          title: c.title,
          tagline: c.tagline ?? null,
          description: c.description ?? null,
          ctaLabel1: c.ctaLabel1,
          ctaLabel2: c.ctaLabel2,
        })
        .onConflictDoUpdate({
          target: [landingHeroI18n.heroId, landingHeroI18n.locale],
          set: {
            title: c.title,
            tagline: c.tagline ?? null,
            description: c.description ?? null,
            ctaLabel1: c.ctaLabel1,
            ctaLabel2: c.ctaLabel2,
          },
        });
    });
  }
  await bustLandingCache();
}

// --- Settings (sections + SEO) ---------------------------------------------

export type SectionSettingsDraft = {
  key: string;
  translations: TranslatedContent<{ heading: string; description?: string | null }>;
};

export type LandingSettingsInput = {
  seo?: TranslatedContent<{ seoTitle?: string | null; seoDescription?: string | null }>;
  sections: SectionSettingsDraft[];
};

export async function updateSettings(input: LandingSettingsInput): Promise<void> {
  const pageId = await findHomePageId();
  if (input.seo) {
    const seo = input.seo;
    await eachLocale((l) => {
      const c = seo[l];
      return db
        .insert(landingPagesI18n)
        .values({
          landingPageId: pageId,
          locale: l,
          seoTitle: c.seoTitle ?? null,
          seoDescription: c.seoDescription ?? null,
        })
        .onConflictDoUpdate({
          target: [landingPagesI18n.landingPageId, landingPagesI18n.locale],
          set: { seoTitle: c.seoTitle ?? null, seoDescription: c.seoDescription ?? null },
        });
    });
  }
  for (const section of input.sections) {
    const [row] = await db
      .select({ id: landingSections.id })
      .from(landingSections)
      .where(and(eq(landingSections.landingPageId, pageId), eq(landingSections.key, section.key)))
      .limit(1);
    if (!row) continue;
    await eachLocale((l) => {
      const c = section.translations[l];
      return db
        .insert(landingSectionsI18n)
        .values({ sectionId: row.id, locale: l, heading: c.heading, description: c.description ?? null })
        .onConflictDoUpdate({
          target: [landingSectionsI18n.sectionId, landingSectionsI18n.locale],
          set: { heading: c.heading, description: c.description ?? null },
        });
    });
  }
  await bustLandingCache();
}