import type { Locale } from "./types";

export const STEPS = [
  { id: 1, key: "identity" },
  { id: 2, key: "appearance" },
  { id: 3, key: "localization" },
  { id: 4, key: "seo" },
  { id: 5, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher. */
export const LANG_AWARE_STEPS = new Set<number>([1, 3, 4]);

export const LOCALES: readonly Locale[] = ["en", "fa"] as const;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}


const KEBAB_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isKebabSlug(value: string): boolean {
  return KEBAB_PATTERN.test(value);
}
