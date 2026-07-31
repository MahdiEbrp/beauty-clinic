/**
 * Per-locale display data.
 *
 * `short` is the compact chip label shown in the locale switcher. It is the
 * language's own endonym abbreviation, identical in every catalogue, so it lives
 * here rather than in the message files (there is nothing to translate).
 *
 * The switcher's accessible name uses `Intl.DisplayNames` instead, which renders
 * the target language in the *current* locale ("انگلیسی" when browsing in fa,
 * "Persian" when browsing in en).
 */
export const localeMeta = {
  en: { short: "EN", dir: "ltr" },
  fa: { short: "فا", dir: "rtl" },
} as const satisfies Record<string, { short: string; dir: "ltr" | "rtl" }>;

export type LocaleMetaKey = keyof typeof localeMeta;

export function isLocaleMetaKey(value: string): value is LocaleMetaKey {
  return value in localeMeta;
}
