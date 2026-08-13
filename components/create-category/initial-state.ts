import type { AdminServiceCategory } from "@/lib/services/types";

import { slugify } from "../create-group/helpers";
import type { LangContent, LangSeo, Locale } from "./types";

export type CategoryWizardSeed = {
  groupId: string;
  content: Record<Locale, LangContent>;
  seo: Record<Locale, LangSeo>;
  slugDraft: string;
  slugManual: boolean;
  isActive: boolean;
  displayOrder: string;
  iconKey: string;
  imageUrl: string;
};

function toLangContent(locale: Locale, category: AdminServiceCategory): LangContent {
  const translation = locale === "en" ? category.translations.en : category.translations.fa;
  return {
    name: translation?.name ?? "",
    description: translation?.description ?? "",
  };
}

function toLangSeo(locale: Locale, category: AdminServiceCategory): LangSeo {
  const translation = locale === "en" ? category.translations.en : category.translations.fa;
  return {
    title: translation?.seoTitle ?? "",
    description: translation?.seoDescription ?? "",
  };
}

/**
 * Seeds the category wizard from an existing category so the same components
 * drive the edit flow. The slug stays on auto when it still matches the
 * English name, otherwise it is restored as a manual override.
 */
export function seedFromCategory(category: AdminServiceCategory): CategoryWizardSeed {
  const autoSlug = slugify(category.translations.en?.name ?? "");
  const slug = category.slug || autoSlug;
  return {
    groupId: category.groupId,
    content: {
      en: toLangContent("en", category),
      fa: toLangContent("fa", category),
    },
    seo: { en: toLangSeo("en", category), fa: toLangSeo("fa", category) },
    slugDraft: slug,
    slugManual: slug !== autoSlug,
    isActive: category.isActive,
    displayOrder: String(category.displayOrder),
    iconKey: category.icon ?? "Sparkles",
    imageUrl: category.image ?? "",
  };
}
