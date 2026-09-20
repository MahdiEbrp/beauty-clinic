import type { MetadataRoute } from "next";
import { routing } from "@/src/i18n/routing";
import { siteUrl, localePath } from "@/lib/site";
import { getCategoryCatalog } from "@/lib/services/category-page";
import { getGroupCatalog } from "@/lib/services/group-page";

const pages = ["/", "/pricing", "/services", "/care", "/rules"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

    const groups = await getGroupCatalog(locale);
    for (const groupSlug of groups) {
      const href = `/services/${groupSlug}`;
      const pagePath = path === "/" ? href : `${path}${href}`;
      entries.push({
        url: `${siteUrl}${pagePath}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }

    const categories = await getCategoryCatalog(locale);
    for (const category of categories) {
      const href = `/services/${category.groupSlug}/${category.categorySlug}`;
      const pagePath = path === "/" ? href : `${path}${href}`;
      entries.push({
        url: `${siteUrl}${pagePath}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}