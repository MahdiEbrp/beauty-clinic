import type { PublicServiceTree, PublicTreeService } from "@/lib/services/types";
import { groupDurationMin } from "@/data/pricing-media";

export type SortKey = "recommended" | "priceAsc" | "priceDesc";
export type PriceBucket = "low" | "mid" | "high";

export type CatalogFilters = {
  groupSlug: string | null;
  priceBucket: PriceBucket | null;
  sort: SortKey;
};

export const defaultFilters: CatalogFilters = {
  groupSlug: null,
  priceBucket: null,
  sort: "recommended",
};

/** One card per service category, carrying its group context and price range. */
export type CategoryCardData = {
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  groupSlug: string;
  groupTitle: string;
  services: PublicTreeService[];
  minPrice: number | null;
  maxPrice: number | null;
  optionsCount: number;
  durationMin: number;
};

/** Build the category-card list (display order preserved) from the public tree. */
export function buildCategoryCards(tree: PublicServiceTree): CategoryCardData[] {
  const cards: CategoryCardData[] = [];
  for (const group of tree.groups) {
    for (const category of group.categories) {
      const prices = category.services
        .map((service) =>
          service.priceType === "on_request" || service.price === null
            ? null
            : service.price,
        )
        .filter((price): price is number => price !== null);

      cards.push({
        slug: category.slug,
        title: category.title,
        description: category.description,
        icon: category.icon,
        image: category.image ?? group.image,
        groupSlug: group.slug,
        groupTitle: group.title,
        services: category.services,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        optionsCount: category.services.length,
        durationMin: groupDurationMin(group.slug),
      });
    }
  }
  return cards;
}

/** Min/max of concrete prices across all cards (fixed/from only). */
export function priceBounds(
  cards: CategoryCardData[],
): { min: number; max: number } | null {
  let min: number | null = null;
  let max: number | null = null;
  for (const card of cards) {
    if (card.minPrice === null || card.maxPrice === null) continue;
    min = min === null ? card.minPrice : Math.min(min, card.minPrice);
    max = max === null ? card.maxPrice : Math.max(max, card.maxPrice);
  }
  if (min === null || max === null || min === max) return null;
  return { min, max };
}

/** [from, to] range for a price bucket divided into thirds. */
export function bucketRange(
  bounds: { min: number; max: number },
  bucket: PriceBucket,
): { from: number; to: number } {
  const step = (bounds.max - bounds.min) / 3;
  if (bucket === "low") return { from: bounds.min, to: bounds.min + step };
  if (bucket === "high") return { from: bounds.min + 2 * step, to: bounds.max };
  return { from: bounds.min + step, to: bounds.min + 2 * step };
}

function matchesBucket(minPrice: number | null, bucket: PriceBucket | null, bounds: { min: number; max: number } | null): boolean {
  if (!bucket || !bounds || minPrice === null) return true;
  const range = bucketRange(bounds, bucket);
  return minPrice >= range.from && minPrice <= range.to;
}

/** Filter + sort the category cards for the pricing grid. */
export function filterCards(
  cards: CategoryCardData[],
  filters: CatalogFilters,
  search: string,
): CategoryCardData[] {
  const query = search.trim().toLowerCase();
  const bounds = priceBounds(cards);

  const result = cards.filter((card) => {
    if (filters.groupSlug && card.groupSlug !== filters.groupSlug) return false;
    if (!matchesBucket(card.minPrice, filters.priceBucket, bounds)) return false;
    if (query) {
      const blob = [card.title, card.description, card.groupTitle]
        .filter(Boolean)
        .concat(card.services.map((service) => `${service.title} ${service.shortDesc ?? ""}`))
        .join(" ")
        .toLowerCase();
      if (!blob.includes(query)) return false;
    }
    return true;
  });

  if (filters.sort === "priceAsc") {
    result.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
  } else if (filters.sort === "priceDesc") {
    result.sort((a, b) => (b.maxPrice ?? -Infinity) - (a.maxPrice ?? -Infinity));
  }
  // "recommended" keeps catalog order.

  return result;
}
