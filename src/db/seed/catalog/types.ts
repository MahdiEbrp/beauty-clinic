// ---------------------------------------------------------------------------
// Catalog seed data — reflects the live catalog in the database.
//
// Structure mirrors db schema: groups -> categories -> services, each with
// per-locale (fa/en) i18n. Prices are in Toman, stored as plain numbers here
// and cast to numeric-string on insert (schema uses numeric()).
//
// Group-level fields (slug, icon, image, displayOrder, fa/en + SEO) are the
// source of truth from the live `service_groups` / `service_groups_i18n`
// tables. Categories/services come from the clinic price-list and are new
// inserts (the DB currently holds no categories or services).
//
// NOTES:
// - Duplicate brand names across injection-area categories get area-suffixed
//   slugs so they don't collide on the global-unique `services.slug` index:
//     innovance-lip-chin-cheek     vs  innovance-undereye-nose-temple
//     fillerge-lip-chin-cheek      vs  fillerge-undereye-nose-temple
//     neuramis-lip-chin-cheek      vs  neuramis-undereye-nose-temple
// - "کاربردی" spelling used per Mahdi's text list.
// - tattoo-removal (Q-Switch) and hifu have no pricing yet -> on_request.
// - "نمی‌دونم چه خدماتی نیاز دارم" is intentionally NOT a group — it is a UI
//   entry point / CTA, not a billable service category.
// ---------------------------------------------------------------------------

export type SeedServiceI18n = {
  locale: "fa" | "en";
  title: string;
  shortDesc: string;
  seoTitle: string;
  seoDescription: string;
};

// Only the (required) brief identity — title. Filled out by `withSeo`.
export type SeedServiceSeed = Omit<SeedService, "i18n"> & {
  i18n: { locale: "fa" | "en"; title: string }[];
};

export type SeedServiceSeo = {
  fa: { shortDesc: string; seoTitle: string; seoDescription: string };
  en: { shortDesc: string; seoTitle: string; seoDescription: string };
};

export type SeedService = {
  slug: string;
  price: number | null; // null => on_request
  priceType: "fixed" | "from" | "on_request";
  displayOrder: number;
  i18n: SeedServiceI18n[];
};

export type SeedCategoryI18n = {
  locale: "fa" | "en";
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type SeedCategory = {
  slug: string;
  icon?: string;
  image?: string;
  displayOrder: number;
  i18n: SeedCategoryI18n[];
  services: SeedService[];
};

export type SeedGroupI18n = {
  locale: "fa" | "en";
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type SeedGroup = {
  slug: string;
  icon?: string;
  image?: string;
  displayOrder: number;
  i18n: SeedGroupI18n[];
  categories: SeedCategory[];
};

// Helper so every service doesn't need to repeat locale boilerplate.
// Both fa and en titles are required — every catalog entity ships both locales.
// Every service is completed with shortDesc + SEO (seoTitle ≤60, seoDescription
// ≤160) via `withSeo`, so no field is ever empty in the database.
export function svc(
  slug: string,
  faTitle: string,
  enTitle: string,
  price: number | null,
  displayOrder: number,
  priceType: SeedService["priceType"] = "fixed",
): SeedServiceSeed {
  return {
    slug,
    price,
    priceType,
    displayOrder,
    i18n: [
      { locale: "fa", title: faTitle },
      { locale: "en", title: enTitle },
    ],
  };
}

// Completes a service (created via `svc`) with the full fa/en shortDesc + SEO.
// Every service must pass through here so title, shortDesc and SEO all carry
// values in both locales before being written to the database.
export function withSeo(service: SeedServiceSeed, seo: SeedServiceSeo): SeedService {
  return {
    ...service,
    i18n: service.i18n.map((entry) => {
      const seoEntry = seo[entry.locale];
      return { ...entry, ...seoEntry };
    }),
  };
}