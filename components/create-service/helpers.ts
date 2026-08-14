import type { LangContent, LangSeo, Locale } from "./types";

export const SERVICE_STEPS = [
  { id: 1, key: "category" },
  { id: 2, key: "identity" },
  { id: 3, key: "pricing" },
  { id: 4, key: "appearance" },
  { id: 5, key: "localization" },
  { id: 6, key: "seo" },
  { id: 7, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher. */
export const SERVICE_LANG_AWARE_STEPS = new Set<number>([2, 5, 6]);

// Re-export so wizard modules can reuse the same slug utilities as the group
// and category wizards.
export { slugify, isKebabSlug } from "../create-group/helpers";

export type { LangContent, LangSeo, Locale };
