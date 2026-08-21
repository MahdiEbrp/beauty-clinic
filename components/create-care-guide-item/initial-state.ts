import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";

import type { LangContent, Locale } from "./types";

export type ItemWizardSeed = {
  guideId: string;
  content: Record<Locale, LangContent>;
  isActive: boolean;
  highlighted: boolean;
  displayOrder: string;
};

function toLangContent(locale: Locale, item: AdminCareGuideItem): LangContent {
  const translation = locale === "en" ? item.translations.en : item.translations.fa;
  return {
    title: translation?.title ?? "",
    description: translation?.description ?? "",
  };
}

export function seedFromItem(item: AdminCareGuideItem): ItemWizardSeed {
  return {
    guideId: item.guideId,
    content: { en: toLangContent("en", item), fa: toLangContent("fa", item) },
    isActive: item.isActive,
    highlighted: item.highlighted,
    displayOrder: String(item.displayOrder),
  };
}
