import "server-only";

import { getClinicData } from "@/data/clinic";
import { getPublicServiceTree } from "./public-services";
import { getPublicNavCatalog } from "./public-nav-catalog";
import type {
  Locale,
  PublicServiceTree,
  PublicTreeCategory,
  PublicTreeGroup,
} from "./types";

/**
 * View-model for the public, SEO-friendly category page
 * (`app/[locale]/services/[groupSlug]/[categorySlug]`).
 *
 * Everything is resolved from the existing cached feeds — the public service
 * tree (groups -> categories -> services, localized, `display_order` ordered,
 * `is_active` only) and the clinic settings — so no extra DB round-trips are
 * introduced. Components only render whatever this view model contains.
 */

export type CategoryPageFaq = {
  question: string;
  answer: string;
  displayOrder: number;
};

export type CategoryPageImage = {
  imageUrl: string;
  type: "before" | "after" | "gallery";
  displayOrder: number;
};

export type CategoryPageService = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  fullDesc: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  price: number | null;
  priceType: "fixed" | "from" | "on_request";
  durationMin: number | null;
  sessionsCount: number;
  coverImage: string | null;
  isFeatured: boolean;
  updatedAt: Date;
  displayOrder: number;
  images: CategoryPageImage[];
  faqs: CategoryPageFaq[];
};

export type CategoryPageCategory = {
  slug: string;
  icon: string | null;
  image: string | null;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  displayOrder: number;
  services: CategoryPageService[];
};

export type CategoryPageGroup = {
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
};

export type CategoryPageData = {
  currency: string;
  /** The active category that this page is about. */
  category: CategoryPageCategory;
  /** The group the category belongs to (for breadcrumb + context). */
  group: CategoryPageGroup;
  /** Other categories under the same group. */
  siblings: CategoryPageCategory[];
};

function toCategory(category: PublicTreeCategory): CategoryPageCategory {
  return {
    slug: category.slug,
    icon: category.icon,
    image: category.image,
    title: category.title,
    description: category.description,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    updatedAt: category.updatedAt,
    displayOrder: category.displayOrder,
    services: category.services.map((service) => ({
      id: service.id,
      slug: service.slug,
      title: service.title,
      shortDesc: service.shortDesc,
      fullDesc: service.fullDesc,
      seoTitle: service.seoTitle,
      seoDescription: service.seoDescription,
      price: service.price,
      priceType: service.priceType,
      durationMin: service.durationMin,
      sessionsCount: service.sessionsCount,
      coverImage: service.coverImage,
      isFeatured: service.isFeatured,
      updatedAt: service.updatedAt,
      displayOrder: service.displayOrder,
      images: service.images,
      faqs: service.faqs,
    })),
  };
}

/**
 * Loads a category's page by group + category slug, or null when either slug
 * is unknown (the route then calls `notFound()`). Uses the cached public tree
 * for the locale, so it never opens a new DB connection.
 */
export async function getCategoryPage(
  locale: Locale,
  groupSlug: string,
  categorySlug: string,
): Promise<CategoryPageData | null> {
  const tree: PublicServiceTree = await getPublicServiceTree(locale);

  const group = tree.groups.find((g) => g.slug === groupSlug);
  if (!group) return null;

  const category = group.categories.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const clinic = await getClinicData(locale);

  return {
    currency: clinic.currency,
    category: toCategory(category),
    group: toGroup(group),
    siblings: group.categories
      .filter((c) => c.slug !== categorySlug)
      .map((c) => toCategory(c)),
  };
}

function toGroup(group: PublicTreeGroup): CategoryPageGroup {
  return {
    slug: group.slug,
    icon: group.icon,
    title: group.title,
    description: group.description,
  };
}

/**
 * Every active (group, category) pair for the locale, with real edit timestamps
 * — used by the dynamic sitemap for `lastModified` and hreflang clusters.
 * Reading from the nav catalog keeps the sitemap on the lightweight feed rather
 * than the full service tree.
 */
export async function getCategoryCatalog(
  locale: Locale,
): Promise<{ groupSlug: string; categorySlug: string; updatedAt: Date }[]> {
  const nav = await getPublicNavCatalog(locale);
  const pairs: { groupSlug: string; categorySlug: string; updatedAt: Date }[] = [];
  for (const group of nav.groups) {
    for (const category of group.categories) {
      pairs.push({
        groupSlug: group.slug,
        categorySlug: category.slug,
        updatedAt: category.updatedAt,
      });
    }
  }
  return pairs;
}