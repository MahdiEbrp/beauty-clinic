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
import type {
  CategoryPageFaq,
  CategoryPageService,
} from "./category-page";

/**
 * View-model for the public, SEO-friendly group index page
 * (`app/[locale]/services/[groupSlug]`).
 *
 * Like the category page, everything resolves from the existing cached feeds
 * (the public service tree + clinic settings), so no extra DB round-trips are
 * introduced. The category cards come from the group's categories; featured
 * services and the FAQ are aggregated across every category in the group.
 */

export type GroupPageCategory = {
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
  serviceCount: number;
  updatedAt: Date;
};

export type GroupPageGroup = {
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

export type GroupPageData = {
  currency: string;
  /** The active group this page is about. */
  group: GroupPageGroup;
  /** Categories under the group, for the card grid. */
  categories: GroupPageCategory[];
  /** Featured services across all of the group's categories. */
  featured: (CategoryPageService & { categorySlug: string })[];
  /** FAQs aggregated across the group's services (de-duplicated). */
  faqs: CategoryPageFaq[];
};

function toCategorySummary(category: PublicTreeCategory): GroupPageCategory {
  return {
    slug: category.slug,
    icon: category.icon,
    title: category.title,
    description: category.description,
    serviceCount: category.services.length,
    updatedAt: category.updatedAt,
  };
}

function toService(
  service: CategoryPageService,
  categorySlug: string,
): CategoryPageService & { categorySlug: string } {
  return { ...service, categorySlug };
}

/**
 * Loads a group's index data by slug, or null when the slug is unknown (the
 * route then calls `notFound()`). Uses the cached public tree for the locale.
 */
export async function getGroupPage(
  locale: Locale,
  groupSlug: string,
): Promise<GroupPageData | null> {
  const tree: PublicServiceTree = await getPublicServiceTree(locale);

  const treeGroup = tree.groups.find((g) => g.slug === groupSlug);
  if (!treeGroup) return null;

  const clinic = await getClinicData(locale);

  const categories = treeGroup.categories.map(toCategorySummary);

  const seen = new Set<string>();
  const featured: (CategoryPageService & { categorySlug: string })[] = [];
  const faqs: CategoryPageFaq[] = [];

  for (const category of treeGroup.categories) {
    for (const service of category.services) {
      const mapped = toService(service, category.slug);
      if (service.isFeatured) featured.push(mapped);

      for (const faq of service.faqs) {
        if (!faq.answer || seen.has(faq.question)) continue;
        seen.add(faq.question);
        faqs.push({ question: faq.question, answer: faq.answer, displayOrder: faq.displayOrder });
      }
    }
  }

  return {
    currency: clinic.currency,
    group: toGroup(treeGroup),
    categories,
    featured,
    faqs,
  };
}

function toGroup(group: PublicTreeGroup): GroupPageGroup {
  return {
    slug: group.slug,
    icon: group.icon,
    title: group.title,
    description: group.description,
    seoTitle: group.seoTitle,
    seoDescription: group.seoDescription,
    updatedAt: group.updatedAt,
  };
}

/**
 * Every active group slug for the locale, with its real edit timestamp — used
 * by the dynamic sitemap for `lastModified` and (if ever needed) for
 * generateStaticParams-style pre-render. Reading from the nav catalog keeps the
 * sitemap on the lightweight feed instead of the full service tree.
 */
export async function getGroupCatalog(
  locale: Locale,
): Promise<{ groupSlug: string; updatedAt: Date }[]> {
  const nav = await getPublicNavCatalog(locale);
  return nav.groups.map((group) => ({ groupSlug: group.slug, updatedAt: group.updatedAt }));
}