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
  return {
    name: group.translations[locale]?.name ?? "",
    description: group.translations[locale]?.description ?? "",
  };
}

function toLangSeo(locale: Locale, group: AdminServiceGroup): LangSeo {
  return {
    title: group.translations[locale]?.seoTitle ?? "",
    description: group.translations[locale]?.seoDescription ?? "",
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
