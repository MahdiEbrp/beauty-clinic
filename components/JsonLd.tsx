import { getTranslations, getLocale } from "next-intl/server";
import { getClinicData } from "@/data/clinic";
import { getPublicNavCatalog } from "@/lib/services/public-nav-catalog";
import { buildSiteGraph } from "@/lib/seo/schema";
import { IMG } from "@/lib/images";
import type { Locale } from "@/lib/services/types";

/**
 * Site-wide JSON-LD. Mounted once in the locale layout so every page carries the
 * clinic and website entities.
 *
 * The nav catalog it reads is the same cached feed the navbar already loads on
 * this request, so this costs no additional database work.
 */
export default async function JsonLd() {
  const locale = await getLocale();
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tJsonLd = await getTranslations({ locale, namespace: "jsonLd" });
  const [clinic, catalog] = await Promise.all([
    getClinicData(locale as Locale),
    getPublicNavCatalog(locale as Locale),
  ]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: buildSiteGraph({
          clinic,
          locale,
          name: tSite("name"),
          description: tJsonLd("description"),
          image: IMG.clinic,
          groups: catalog.groups,
        }),
      }}
    />
  );
}