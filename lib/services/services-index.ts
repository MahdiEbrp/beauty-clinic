import "server-only";

import { getClinicData } from "@/data/clinic";
import { getPublicServiceTree } from "./public-services";
import { hasPublicSubcategories } from "./catalog-navigation";
import type {
  Locale,
  PublicServiceTree,
  PublicTreeCategory,
  PublicTreeGroup,
} from "./types";

/**
 * View-model for the public `/services` hub page.
 *
 * The hub mirrors the SEO pages (group + category) and lists every active
 * group with its categories and per-category service counts, so the landing
 * page links deeper into the catalog (`/services/[group]` and
 * `/services/[group]/[category]`). All data resolves from the existing cached
 * tree + clinic settings — no extra DB round-trips.
 */

export type ServicesIndexCategory = {
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
  serviceCount: number;
};

export type ServicesIndexGroup = {
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
  categories: ServicesIndexCategory[];
};

export type ServicesIndexData = {
  currency: string;
  groups: ServicesIndexGroup[];
};

function toCategory(category: PublicTreeCategory): ServicesIndexCategory {
  return {
    slug: category.slug,
    icon: category.icon,
    title: category.title,
    description: category.description,
    serviceCount: category.services.length,
  };
}

function toGroup(group: PublicTreeGroup): ServicesIndexGroup {
  return {
    slug: group.slug,
    icon: group.icon,
    title: group.title,
    description: group.description,
    categories: hasPublicSubcategories(group.slug)
      ? group.categories.map(toCategory)
      : [],
  };
}

/** Loads hub data for the `/services` landing page from the cached tree. */
export async function getServicesIndex(
  locale: Locale,
): Promise<ServicesIndexData> {
  const tree: PublicServiceTree = await getPublicServiceTree(locale);
  const clinic = await getClinicData(locale);
  return {
    currency: clinic.currency,
    groups: tree.groups.map(toGroup),
  };
}