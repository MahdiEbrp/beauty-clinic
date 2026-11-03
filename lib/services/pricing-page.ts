import "server-only";

import { getClinicData } from "@/data/clinic";
import { loadSystemSettingsDataset, type SystemSettingEntry } from "@/lib/settings/loader";
import { getPublicServiceTree } from "./public-services";
import type { Locale, PriceType, PublicServiceTree, ServiceDetailImage } from "./types";

/**
 * View-model for the public, fully DB-driven pricing/article page.
 *
 * Every piece of clinic content (titles, descriptions, prices, units, FAQs,
 * SEO metadata, CTA copy, last-updated) is resolved here from the database —
 * never hardcoded in a component. The catalog content comes from the existing
 * `service_groups -> service_categories -> services` tree (localized, ordered
 * by `display_order`, `is_active` only); the page-level copy lives in the
 * system `settings` store (keys `pricing.*`).
 *
 * Components only render whatever this view model contains.
 */

export type PricingFaq = {
  question: string;
  answer: string;
};

export type PricingService = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  price: number | null;
  priceType: PriceType;
  durationMin: number | null;
  sessionsCount: number;
  coverImage: string | null;
  isFeatured: boolean;
  images: ServiceDetailImage[];
  displayOrder: number;
};

export type PricingCategory = {
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  services: PricingService[];
};

export type PricingGroup = {
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  categories: PricingCategory[];
};

export type PricingCta = {
  title: string | null;
  description: string | null;
  primaryLabel: string | null;
  primaryUrl: string | null;
  secondaryLabel: string | null;
  secondaryUrl: string | null;
};

export type PricingSearchEntry = {
  groupSlug: string;
  text: string;
};

export type PricingPageData = {
  currency: string;
  groups: PricingGroup[];
  faqs: PricingFaq[];
  page: {
    title: string;
    intro: string | null;
    updatedLabel: string | null;
  };
  seo: {
    title: string;
    description: string;
  };
  cta: PricingCta;
  search: PricingSearchEntry[];
};
/** Picks the localized string value of an active system setting (falling back to its base value). */
function settingString(
  rows: SystemSettingEntry[],
  key: string,
  locale: Locale,
): string | null {
  const row = rows.find((r) => r.key === key && r.isActive);
  if (!row) return null;
  const localized = row.translations[locale];
  if (localized === undefined || localized === null) {
    return typeof row.value === "string" ? row.value : null;
  }
  return String(localized);
}

/** Formats an ISO/date string for the active locale (Jalali in fa). */
function formatUpdated(raw: string | null, locale: Locale): string | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return raw;
  }
}

function toGroups(tree: PublicServiceTree): PricingGroup[] {
  return tree.groups.map((group) => ({
    slug: group.slug,
    title: group.title,
    description: null,
    displayOrder: group.displayOrder,
    categories: group.categories.map((category) => ({
      slug: category.slug,
      title: category.title,
      description: null,
      displayOrder: category.displayOrder,
      services: category.services.map((service) => ({
        id: service.id,
        slug: service.slug,
        title: service.title,
        shortDesc: null,
        price: service.price,
        priceType: service.priceType,
        durationMin: service.durationMin,
        sessionsCount: service.sessionsCount,
        coverImage: service.coverImage,
        isFeatured: service.isFeatured,
        images: service.images,
        displayOrder: service.displayOrder,
      })),
    })),
  }));
}

/** Aggregates all active service FAQs into one de-duplicated, page-wide list. */
function toFaqs(tree: PublicServiceTree): PricingFaq[] {
  const seen = new Set<string>();
  const faqs: PricingFaq[] = [];
  for (const group of tree.groups) {
    for (const category of group.categories) {
      for (const service of category.services) {
        for (const faq of service.faqs) {
          if (!faq.answer || seen.has(faq.question)) continue;
          seen.add(faq.question);
          faqs.push({ question: faq.question, answer: faq.answer });
        }
      }
    }
  }
  return faqs;
}

/** Builds a lowercase search index (service title + short desc + category + group). */
function toSearch(tree: PublicServiceTree): PricingSearchEntry[] {
  const entries: PricingSearchEntry[] = [];
  for (const group of tree.groups) {
    for (const category of group.categories) {
      for (const service of category.services) {
        const text = [service.title, service.shortDesc, category.title, group.title]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        entries.push({ groupSlug: group.slug, text });
      }
    }
  }
  return entries;
}

/**
 * Loads the complete public pricing page from the database, normalized into the
 * `PricingPageData` view model. Sequential (non-fanned-out) queries stay within
 * the pool/connection budget; the underlying tree + settings are cached.
 */
export async function getPricingPage(locale: Locale): Promise<PricingPageData> {
  const tree = await getPublicServiceTree(locale);
  const clinic = await getClinicData(locale);
  const settingsRows = await loadSystemSettingsDataset();

  const updatedRaw = settingString(settingsRows, "pricing.page.updated", locale);

  return {
    currency: clinic.currency,
    groups: toGroups(tree),
    faqs: toFaqs(tree),
    page: {
      title: settingString(settingsRows, "pricing.page.title", locale) ?? "",
      intro: settingString(settingsRows, "pricing.page.intro", locale),
      updatedLabel: formatUpdated(updatedRaw, locale),
    },
    seo: {
      title: settingString(settingsRows, "pricing.page.seo_title", locale) ?? "",
      description:
        settingString(settingsRows, "pricing.page.seo_description", locale) ?? "",
    },
    cta: {
      title: settingString(settingsRows, "pricing.cta.title", locale),
      description: settingString(settingsRows, "pricing.cta.description", locale),
      primaryLabel: settingString(settingsRows, "pricing.cta.primary_label", locale),
      primaryUrl: settingString(settingsRows, "pricing.cta.primary_url", locale),
      secondaryLabel: settingString(settingsRows, "pricing.cta.secondary_label", locale),
      secondaryUrl: settingString(settingsRows, "pricing.cta.secondary_url", locale),
    },
    search: toSearch(tree),
  };
}