import type { AdminServiceGroup } from "@/lib/services/types";

import { slugify } from "./helpers";
import type { LangContent, LangSeo, Locale } from "./types";

export type GroupWizardSeed = {
  content: Record<Locale, LangContent>;
  seo: Record<Locale, LangSeo>;
  slugDraft: string;
  slugManual: boolean;
  isActive: boolean;
  displayOrder: string;
  iconKey: string;
  imageUrl: string;
};

function toLangContent(locale: Locale, group: AdminServiceGroup): LangContent {
  const translation = locale === "en" ? group.translations.en : group.translations.fa;
  return {
    name: translation?.name ?? "",
    description: translation?.description ?? "",
  };
}

function toLangSeo(locale: Locale, group: AdminServiceGroup): LangSeo {
  const translation = locale === "en" ? group.translations.en : group.translations.fa;
  return {
    title: translation?.seoTitle ?? "",
    description: translation?.seoDescription ?? "",
  };
}

/**
 * Seeds the wizard from an existing group so the same components can drive
 * the edit flow. The slug stays on auto when it still matches the English
 * name, otherwise it is restored as a manual override to preserve it.
 */
export function seedFromGroup(group: AdminServiceGroup): GroupWizardSeed {
  const autoSlug = slugify(group.translations.en?.name ?? "");
  const slug = group.slug || autoSlug;
  return {
    content: { en: toLangContent("en", group), fa: toLangContent("fa", group) },
    seo: { en: toLangSeo("en", group), fa: toLangSeo("fa", group) },
    slugDraft: slug,
    slugManual: slug !== autoSlug,
    isActive: group.isActive,
    displayOrder: String(group.displayOrder),
    iconKey: group.icon ?? "Sparkles",
    imageUrl: group.image ?? "",
  };
}
