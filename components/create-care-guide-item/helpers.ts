export const STEPS = [
  { id: 1, key: "guide" },
  { id: 2, key: "identity" },
  { id: 3, key: "localization" },
  { id: 4, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher. */
export const LANG_AWARE_STEPS = new Set<number>([2, 3]);
