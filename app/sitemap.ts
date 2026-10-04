import type { MetadataRoute } from "next";
import { routing } from "@/src/i18n/routing";
import { pageUrl } from "@/lib/site";
import { getCategoryCatalog } from "@/lib/services/category-page";
import { getGroupCatalog } from "@/lib/services/group-page";

/**
 * Marketing pages that have no row behind them, so their freshness comes from
 * the deployment rather than the database. `/booking` belongs here: it was
 * indexable (it sets a full canonical + hreflang cluster) but missing from the
 * sitemap, so it was only discoverable by following links.
 */
const staticPages: {
  path: string;
  changeFrequency: "monthly" | "weekly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.8 },
  { path: "/care", changeFrequency: "monthly", priority: 0.6 },
  { path: "/rules", changeFrequency: "monthly", priority: 0.4 },
  { path: "/booking", changeFrequency: "weekly", priority: 0.7 },
];

/**
 * Static pages have no DB row to date them, so a fixed epoch is used rather than
 * `new Date()`. Claiming "changed right now" on every render made every
 * `lastModified` identical and meaningless, which trains crawlers to ignore the
 * field entirely — the opposite of the intent.
 */
const STATIC_LAST_MODIFIED = new Date("2026-01-01T00:00:00.000Z");

export const dynamic = "force-dynamic";

/** Absolute URL for a locale-relative app path (collapses fa to the root). */
function url(locale: string, path: string): string {
  return pageUrl(locale, path);
}

/**
 * hreflang cluster for an app path, keyed by locale. The sitemap has to declare
 * these itself: `lastModified` and `alternates` are not inferred from the page's
 * metadata, so without this the fa/en relationship is only discoverable from the
 * rendered `<link rel="alternate">` tags.
 */
function alternates(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {
    "x-default": pageUrl(routing.defaultLocale, path),
  };
  for (const locale of routing.locales) languages[locale] = pageUrl(locale, path);
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const isDefault = locale === routing.defaultLocale;

    for (const page of staticPages) {
      entries.push({
        url: url(locale, page.path),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: page.changeFrequency,
        // The default locale is the one served at the origin root, so it holds
        // the top priority and the prefixed variant steps down below it.
        priority: isDefault ? page.priority : Number((page.priority * 0.8).toFixed(2)),
        alternates: alternates(page.path),
      });
    }

    const groups = await getGroupCatalog(locale);
    for (const group of groups) {
      const path = `/services/${group.groupSlug}`;
      entries.push({
        url: url(locale, path),
        // Real edit timestamp from the group row, so crawlers can tell an
        // actual content change from a re-render.
        lastModified: group.updatedAt,
        changeFrequency: "weekly",
        priority: 0.65,
        alternates: alternates(path),
      });
    }

    const categories = await getCategoryCatalog(locale);
    for (const category of categories) {
      const path = `/services/${category.groupSlug}/${category.categorySlug}`;
      entries.push({
        url: url(locale, path),
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: alternates(path),
      });
    }
  }

  return entries;
}