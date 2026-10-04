import "server-only";

import type { ClinicData } from "@/data/clinic";
import { canonicalUrl, siteUrl } from "@/lib/site";
import type { PublicNavGroup } from "@/lib/services/types";

/**
 * Site-wide structured data, emitted once from the locale layout.
 *
 * Emitted as a single `@graph` so the entities cross-reference by `@id` instead
 * of being independent blobs — that is what lets a search engine or an answer
 * engine resolve "which site does this clinic belong to" rather than seeing an
 * anonymous address with no site attached.
 *
 * Every value here is read from the database (settings + working hours + the
 * service catalog), never hardcoded, so editing the clinic's details in the
 * dashboard updates the markup with no deploy.
 */

/** Stable @id for the clinic entity, referenced by every other node. */
export const CLINIC_ID = `${siteUrl}/#clinic`;

/** Stable @id for the website entity. */
export const WEBSITE_ID = `${siteUrl}/#website`;

export type SchemaInput = {
  clinic: ClinicData;
  locale: string;
  name: string;
  description: string;
  image: string;
  /** Service groups for the offer catalog; empty means the section is omitted. */
  groups: readonly PublicNavGroup[];
};

type JsonLdNode = Record<string, unknown>;

function postalAddress(clinic: ClinicData): JsonLdNode {
  return {
    "@type": "PostalAddress",
    ...clinic.address,
  };
}

/**
 * `geo` is what makes the entity eligible for local results; the coordinates
 * were already stored (`contact.map_lat` / `contact.map_lng`) and driving the
 * map embed, but were never reaching the markup.
 */
function geo(clinic: ClinicData): JsonLdNode {
  return {
    "@type": "GeoCoordinates",
    latitude: clinic.maps.coords.lat,
    longitude: clinic.maps.coords.lng,
  };
}

function openingHours(clinic: ClinicData): JsonLdNode[] {
  return clinic.openingHours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...slot.days],
    opens: slot.opens,
    closes: slot.closes,
  }));
}

/**
 * The catalogue as an `OfferCatalog` of `OfferCatalog` items, one per service
 * group. Group-level rather than per-service on purpose: the markup is emitted
 * on every page from the lightweight nav feed, so building 193 individual
 * `Offer` nodes here would mean loading the full service tree on every request
 * for a page that is mostly not about services. Per-service `Offer` markup
 * belongs on a service's own page.
 */
function offerCatalog(groups: readonly PublicNavGroup[]): JsonLdNode | null {
  if (groups.length === 0) return null;
  return {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: groups.map((group, index) => ({
      "@type": "OfferCatalog",
      position: index + 1,
      name: group.title,
      // Locale-independent: the group URL is the same in both languages apart
      // from the prefix, and the two variants cross-reference via hreflang.
      url: `${siteUrl}/services/${group.slug}`,
    })),
  };
}

/**
 * `BeautySalon` rather than `MedicalBusiness`: this is an aesthetics clinic, and
 * over-claiming a medical type on content that is not medical advice is both a
 * rich-results risk and a trust problem. It already inherits from
 * HealthAndBeautyBusiness > LocalBusiness, so geo/opening hours/hours are read
 * as local-intent signals.
 */
function clinicNode(input: SchemaInput): JsonLdNode {
  const { clinic, locale, name, description, image } = input;
  const catalog = offerCatalog(input.groups);

  return {
    "@type": "BeautySalon",
    "@id": CLINIC_ID,
    name,
    description,
    url: canonicalUrl(locale),
    inLanguage: locale,
    image,
    address: postalAddress(clinic),
    geo: geo(clinic),
    ...(clinic.telephone ? { telephone: clinic.telephone } : {}),
    // Declared explicitly so the entity carries a currency even though prices
    // are rendered with a localized unit label ("تومان" / "Toman").
    currenciesAccepted: clinic.currency,
    openingHoursSpecification: openingHours(clinic),
    areaServed: {
      "@type": "City",
      name: clinic.address.addressLocality,
    },
    ...(catalog ? { hasOfferCatalog: catalog } : {}),
    ...(clinic.social.length > 0
      ? { sameAs: clinic.social.map((link) => link.url) }
      : {}),
  };
}

function websiteNode(input: SchemaInput): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl,
    name: input.name,
    description: input.description,
    inLanguage: input.locale,
    publisher: { "@id": CLINIC_ID },
  };
}

/**
 * Serializes to a single `<script type="application/ld+json">`.
 *
 * `<`, `>` and `&` are escaped so a value containing `</script>` cannot break
 * out of the tag. Without this, any admin-editable field (a service name, a
 * clinic address) becomes a stored-XSS vector, since these strings are rendered
 * unescaped inside a script element.
 */
export function buildSiteGraph(input: SchemaInput): string {
  const graph: JsonLdNode[] = [websiteNode(input), clinicNode(input)];
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  })
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}