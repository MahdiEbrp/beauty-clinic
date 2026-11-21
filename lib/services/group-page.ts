import "server-only";

import { getClinicData } from "@/data/clinic";
import { getPublicServiceTree } from "./public-services";
import { getPublicNavCatalog } from "./public-nav-catalog";
import { hasPublicSubcategories } from "./catalog-navigation";
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
  image: string | null;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

export type GroupPageData = {
  currency: string;
  group: GroupPageGroup;
  categories: GroupPageCategory[];
  hasSubcategories: boolean;
  /** All treatments, used directly when this group has no public subcategories. */
  detailServices: CategoryPageService[];
  featured: (CategoryPageService & { categorySlug: string })[];
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
  const detailServices: CategoryPageService[] = [];
  const faqs: CategoryPageFaq[] = [];

  for (const category of treeGroup.categories) {
    for (const service of category.services) {
      const mapped = toService(service, category.slug);
      detailServices.push(mapped);
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
    hasSubcategories: hasPublicSubcategories(treeGroup.slug),
    detailServices,
    featured,
    faqs,
  };
}

function toGroup(group: PublicTreeGroup): GroupPageGroup {
  return {
    slug: group.slug,
    icon: group.icon,
    image: group.image,
    title: group.title,
    description: group.description,
    seoTitle: group.seoTitle,
    seoDescription: group.seoDescription,
    updatedAt: group.updatedAt,
  };
}

export async function getGroupCatalog(
  locale: Locale,
): Promise<{ groupSlug: string; updatedAt: Date }[]> {
  const nav = await getPublicNavCatalog(locale);
  return nav.groups.map((group) => ({ groupSlug: group.slug, updatedAt: group.updatedAt }));
}
