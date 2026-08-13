export const CATEGORY_STEPS = [
  { id: 1, key: "group" },
  { id: 2, key: "identity" },
  { id: 3, key: "appearance" },
  { id: 4, key: "localization" },
  { id: 5, key: "seo" },
  { id: 6, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher. */
export const CATEGORY_LANG_AWARE_STEPS = new Set<number>([2, 4, 5]);
