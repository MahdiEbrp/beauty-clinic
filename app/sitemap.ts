import type { MetadataRoute } from "next";
import { routing } from "@/src/i18n/routing";
import { siteUrl, localePath } from "@/lib/site";

const pages = ["/", "/pricing", "/services", "/care", "/rules"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const path = localePath(locale);

    for (const page of pages) {
      const pagePath = page === "/" ? path : `${path}${page}`;
      const url = pagePath === "/" ? `${siteUrl}/` : `${siteUrl}${pagePath}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === "/" ? ("monthly" as const) : ("weekly" as const),
        priority: page === "/" ? (locale === routing.defaultLocale ? 1 : 0.8) : 0.7,
      });
    }
  }

  return entries;
}
