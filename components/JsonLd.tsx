import { useTranslations, useLocale } from "next-intl";
import { clinic } from "@/data/clinic";
import { canonicalUrl, siteUrl } from "@/lib/site";

/**
 * `JSON.stringify` does not escape `<` or `/`, so a translated string containing
 * "</script>" would break out of the script element. Escaping the two characters
 * that matter keeps the payload inert while staying valid JSON.
 */
function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function JsonLd() {
  const t = useTranslations();
  const locale = useLocale();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${siteUrl}/#clinic`,
    name: t("site.name"),
    description: t("jsonLd.description"),
    url: canonicalUrl(locale),
    inLanguage: locale,
    image: `${siteUrl}/images/hero-bg.webp`,
    address: {
      "@type": "PostalAddress",
      ...clinic.address,
    },
    // `telephone` is omitted entirely while unknown — a placeholder would make
    // the markup invalid rather than incomplete.
    ...(clinic.telephone ? { telephone: clinic.telephone } : {}),
    openingHoursSpecification: clinic.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...slot.days],
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [clinic.social.rubika, clinic.social.bale],
  };

  return (
    <script
      type="application/ld+json"
      // Serialised from local, non-user-supplied data and escaped above.
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
