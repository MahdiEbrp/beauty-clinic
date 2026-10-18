import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fa"],
  defaultLocale: "fa",
  localePrefix: "as-needed",
  // Always render fa for unprefixed paths — never redirect to /en from
  // Accept-Language/cookie; /en stays available only when requested directly.
  localeDetection: false,
});

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;