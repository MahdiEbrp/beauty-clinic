import type { AdminCareGuide } from "@/lib/services/care-guides-types";

import { slugify } from "./helpers";
import type { LangContent, Locale } from "./types";

export type GuideWizardSeed = {
  content: Record<Locale, LangContent>;
  slugDraft: string;
  slugManual: boolean;
  isActive: boolean;
  displayOrder: string;
  iconKey: string;
};

function toLangContent(locale: Locale, guide: AdminCareGuide): LangContent {
  const translation = locale === "en" ? guide.translations.en : guide.translations.fa;
  return {
    name: translation?.name ?? "",
    description: translation?.description ?? "",
  };
}

export function seedFromGuide(guide: AdminCareGuide): GuideWizardSeed {
  const autoSlug = slugify(guide.translations.en?.name ?? "");
  const slug = guide.slug || autoSlug;
  return {
    content: { en: toLangContent("en", guide), fa: toLangContent("fa", guide) },
    slugDraft: slug,
    slugManual: slug !== autoSlug,
    isActive: guide.isActive,
    displayOrder: String(guide.displayOrder),
    iconKey: guide.icon ?? "BookOpen",
  };
}
