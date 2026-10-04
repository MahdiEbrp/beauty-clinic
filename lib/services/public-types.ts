/**
 * Shared public (marketing site) shapes for the service catalog.
 *
 * These are localized and kept deliberately lightweight for nav / pricing
 * payloads. Split out of `types.ts` to keep that module focused on the
 * admin/internal catalog.
 */

import type { PriceType, ServiceDetailImage } from "./types";

/** A catalog entry rendered on the public site, localized for one locale. */
export type PublicCatalogEntry = {
  slug: string;
  icon: string | null;
  displayOrder: number;
  title: string;
  description: string | null;
};

/** Catalog data consumed by the public marketing pages. */
export type PublicCatalog = {
  groups: PublicCatalogEntry[];
  categories: PublicCatalogEntry[];
};

/**
 * A single service name + slug, for nav/menu use only. Deliberately
 * excludes price, images, faqs, etc. — this is a lightweight sibling to
 * `PublicServiceTree`, not a trimmed copy of it, so navbar/mega menu
 * payloads stay small regardless of how heavy the full service records get.
 * The pricing page link is derived from `groupSlug` + `slug` by the
 * component (`/pricing#pricing-<groupSlug>-<slug>`), so no URL is stored here.
 */
export type PublicNavService = {
  slug: string;
  title: string;
  updatedAt: Date;
};

/** A category with just its services' names, for nav/menu use only. */
export type PublicNavCategory = {
  slug: string;
  title: string;
  updatedAt: Date;
  services: PublicNavService[];
};

/** A group with just its categories' (and their services') names, for nav/menu use only. */
export type PublicNavGroup = {
  slug: string;
  icon: string | null;
  title: string;
  updatedAt: Date;
  categories: PublicNavCategory[];
};

/** Full nav-tree for the public navbar's mega menu / mobile drawer accordion. */
export type PublicNavCatalog = {
  groups: PublicNavGroup[];
};

/** A localized FAQ attached to a public service. */
export type PublicTreeFaq = {
  question: string;
  answer: string;
  displayOrder: number;
};

/** A localized service in the public pricing tree. */
export type PublicTreeService = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  fullDesc: string | null;
  /** Hand-authored per-locale SEO title from `services_i18n.seo_title`. */
  seoTitle: string | null;
  /** Hand-authored per-locale meta description. */
  seoDescription: string | null;
  price: number | null;
  priceType: PriceType;
  durationMin: number | null;
  sessionsCount: number;
  coverImage: string | null;
  isFeatured: boolean;
  images: ServiceDetailImage[];
  faqs: PublicTreeFaq[];
  /** Real edit timestamp, used for sitemap `lastModified`. */
  updatedAt: Date;
};

/** A localized category with its active services. */
export type PublicTreeCategory = {
  slug: string;
  icon: string | null;
  image: string | null;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  services: PublicTreeService[];
};

/** A localized group with its active categories. */
export type PublicTreeGroup = {
  id: string;
  slug: string;
  icon: string | null;
  image: string | null;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  categories: PublicTreeCategory[];
};

/** Full localized service catalog for the public pricing experience. */
export type PublicServiceTree = {
  groups: PublicTreeGroup[];
};

/** A flattened service carrying its group/category context for the UI. */
export type PublicServiceRow = PublicTreeService & {
  groupSlug: string;
  groupTitle: string;
  categorySlug: string;
  categoryTitle: string;
};
