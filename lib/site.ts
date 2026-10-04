import { routing } from "@/src/i18n/routing";

const DEV_SITE_URL = "http://localhost:3000";

/**
 * Canonical origin, no trailing slash.
 *
 * This single value feeds canonical tags, hreflang, sitemap.xml, robots.txt and
 * every JSON-LD `@id`/`url`, so a wrong value makes the whole site advertise a
 * different origin as canonical. In production that is unrecoverable SEO damage
 * (Google indexes the origin named here, not the origin being served), so a
 * missing NEXT_PUBLIC_SITE_URL is a hard boot failure rather than a silent
 * fallback. Outside production we fall back to localhost.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so the variable must be
 * present in the build environment, not just at runtime.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set in production. It defines the canonical " +
        "origin for every canonical tag, hreflang alternate, sitemap entry and " +
        "JSON-LD url/@id. Remember it is inlined at build time.",
    );
  }
  return DEV_SITE_URL;
}

export const siteUrl = resolveSiteUrl();

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

/**
 * Absolute canonical URL for an app path. The default locale resolves to "/"
 * (no prefix), so canonical tags and `languages` alternates never point at a
 * "/fa" redirect: `${siteUrl}/${locale}/x` is wrong for fa and must not be
 * emitted.
 */
export function pageUrl(locale: string, path: string): string {
  const href = localizedHref(locale, path);
  return href === "/" ? `${siteUrl}/` : `${siteUrl}${href}`;
}

/**
 * Canonical tag plus hreflang alternates for an app path.
 *
 * Every page used to hand-roll this block, and one of them got it wrong: a
 * literal `${siteUrl}/${locale}/rules` pointed the fa self-canonical at
 * `/fa/rules`, which permanently redirects to `/rules`. Building the whole
 * cluster from one helper keeps the locale prefix decision in exactly one place
 * and guarantees the self-reference resolves correctly for the unprefixed
 * default locale.
 *
 * `x-default` is declared for crawlers with no locale preference and points at
 * the default locale (fa), which is the only variant served at the origin root.
 */
export function buildAlternates(
  locale: string,
  path: string,
): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {
    "x-default": pageUrl(routing.defaultLocale, path),
  };
  for (const candidate of routing.locales) {
    languages[candidate] = pageUrl(candidate, path);
  }
  return { canonical: pageUrl(locale, path), languages };
}

/**
 * Path-only sibling hrefs for hreflang and the sitemap, e.g.
 * `/services/face-filler`. Kept separate from `pageUrl` so callers can build a
 * whole locale cluster for one path without repeating the slug logic.
 */
export function hreflangLanguages(path: string): Record<string, string> {
  return buildAlternates(routing.defaultLocale, path).languages;
}
