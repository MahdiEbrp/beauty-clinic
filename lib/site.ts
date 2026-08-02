import { routing } from "@/src/i18n/routing";

/**
 * Canonical origin, no trailing slash.
 * Set NEXT_PUBLIC_SITE_URL in the environment; the fallback is the current
 * deployment so previews and local dev still emit absolute URLs.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://beauty-clinic-swart.vercel.app"
).replace(/\/+$/, "");

export type Locale = (typeof routing.locales)[number];

/**
 * Path for a locale under `localePrefix: "as-needed"`.
 *
 * The default locale (fa) is served at "/" and a request to "/fa" is *redirected*
 * to "/". Emitting "/fa" in canonical tags or the sitemap would therefore point
 * search engines at a redirect, so the default locale must resolve to "/".
 */
export function localePath(locale: string): string {
  return locale === routing.defaultLocale ? "/" : `/${locale}`;
}

/** Absolute URL for a locale's home page. */
export function canonicalUrl(locale: string): string {
  const path = localePath(locale);
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;
}

export function dirForLocale(locale: string): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

/**
 * Locale-prefixed href for an app path under `localePrefix: "as-needed"`.
 * The default locale is served at "/" without a prefix.
 */
export function localizedHref(locale: string, path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  const base = localePath(locale);
  if (path === "/") return base;
  return base === "/" ? path : `${base}${path}`;
}
