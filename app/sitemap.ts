import type { MetadataRoute } from "next";
import { routing } from "@/src/i18n/routing";
import { canonicalUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: canonicalUrl(locale),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: locale === routing.defaultLocale ? 1 : 0.8,
  }));
}
