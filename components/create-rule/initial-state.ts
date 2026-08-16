import type { AdminRule } from "@/lib/services/rules-types";

import { slugify } from "./helpers";
import type { LangContent, Locale } from "./types";

export type RuleWizardSeed = {
  content: Record<Locale, LangContent>;
  slugDraft: string;
  slugManual: boolean;
  isActive: boolean;
  highlighted: boolean;
  displayOrder: string;
  iconKey: string;
  color: string;
  imageUrl: string;
};

function toLangContent(locale: Locale, rule: AdminRule): LangContent {
  const translation = locale === "en" ? rule.translations.en : rule.translations.fa;
  return {
    name: translation?.name ?? "",
    description: translation?.description ?? "",
  };
}

/**
 * Seeds the wizard from an existing rule so the same components can drive the
 * edit flow. The slug stays on auto when it still matches the English name,
 * otherwise it is restored as a manual override to preserve it.
 */
export function seedFromRule(rule: AdminRule): RuleWizardSeed {
  const autoSlug = slugify(rule.translations.en?.name ?? "");
  const slug = rule.slug || autoSlug;
  return {
    content: { en: toLangContent("en", rule), fa: toLangContent("fa", rule) },
    slugDraft: slug,
    slugManual: slug !== autoSlug,
    isActive: rule.isActive,
    highlighted: rule.highlighted,
    displayOrder: String(rule.displayOrder),
    iconKey: rule.icon ?? "Clock",
    color: rule.color ?? "copper",
    imageUrl: rule.image ?? "",
  };
}
