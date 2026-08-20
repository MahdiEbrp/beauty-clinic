import { getTranslations, getLocale } from "next-intl/server";
import { getClinicData } from "@/data/clinic";
import { canonicalUrl, siteUrl } from "@/lib/site";
import type { Locale } from "@/lib/services/types";

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default async function JsonLd() {
  const locale = await getLocale();
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tJsonLd = await getTranslations({ locale, namespace: "jsonLd" });
  const clinic = await getClinicData(locale as Locale);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${siteUrl}/#clinic`,
    name: tSite("name"),
    description: tJsonLd("description"),
    url: canonicalUrl(locale),
    inLanguage: locale,
    image: `${siteUrl}/images/hero-bg.webp`,
    address: {
      "@type": "PostalAddress",
      ...clinic.address,
    },
    ...(clinic.telephone ? { telephone: clinic.telephone } : {}),
    openingHoursSpecification: clinic.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...slot.days],
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: clinic.social.map((link) => link.url),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
