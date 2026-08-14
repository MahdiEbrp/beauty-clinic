import type { AdminService } from "@/lib/services/types";

import { slugify } from "../create-group/helpers";
import type { LangContent, LangSeo, Locale, ServiceWizardSeed } from "./types";

function toLangContent(locale: Locale, service: AdminService): LangContent {
  const translation = locale === "en" ? service.translations.en : service.translations.fa;
  return {
    title: translation?.title ?? "",
    shortDesc: translation?.shortDesc ?? "",
    fullDesc: translation?.fullDesc ?? "",
  };
}

function toLangSeo(locale: Locale, service: AdminService): LangSeo {
  const translation = locale === "en" ? service.translations.en : service.translations.fa;
  return {
    title: translation?.seoTitle ?? "",
    description: translation?.seoDescription ?? "",
  };
}

/**
 * Seeds the service wizard from an existing service so the same components
 * drive the edit flow. The slug stays on auto when it still matches the
 * English title, otherwise it is restored as a manual override.
 */
export function seedFromService(service: AdminService): ServiceWizardSeed {
  const autoSlug = slugify(service.translations.en?.title ?? "");
  const slug = service.slug || autoSlug;
  return {
    categoryId: service.categoryId,
    content: {
      en: toLangContent("en", service),
      fa: toLangContent("fa", service),
    },
    seo: { en: toLangSeo("en", service), fa: toLangSeo("fa", service) },
    slugDraft: slug,
    slugManual: slug !== autoSlug,
    isActive: service.isActive,
    isFeatured: service.isFeatured,
    displayOrder: String(service.displayOrder),
    price: service.price === null ? null : String(service.price),
    priceType: service.priceType,
    durationMin: service.durationMin === null ? null : String(service.durationMin),
    sessionsCount: String(service.sessionsCount),
    coverImage: service.coverImage ?? "",
  };
}
