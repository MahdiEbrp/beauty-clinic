export const STEPS = [
  { id: 1, key: "identity" },
  { id: 2, key: "settings" },
  { id: 3, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher (label editing). */
export const LANG_AWARE_STEPS = new Set<number>([1]);

export const LOCALES: readonly ("en" | "fa")[] = ["en", "fa"] as const;

export const URL_PATTERN = /^https?:\/\/.+/;