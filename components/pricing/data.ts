import type {
  PublicServiceRow,
  PublicServiceTree,
} from "@/lib/services/types";

export type SortKey = "recommended" | "priceAsc" | "priceDesc";
export type PriceBucket = "low" | "mid" | "high";

export type CatalogFilters = {
  categorySlug: string | null;
  priceBucket: PriceBucket | null;
  sort: SortKey;
};

export const defaultFilters: CatalogFilters = {
  categorySlug: null,
  priceBucket: null,
  sort: "recommended",
};

/** Flatten the group → category → service tree into row list (display order preserved). */
export function flattenTree(tree: PublicServiceTree): PublicServiceRow[] {
  const rows: PublicServiceRow[] = [];
  for (const group of tree.groups) {
    for (const category of group.categories) {
      for (const service of category.services) {
        rows.push({
          ...service,
          groupSlug: group.slug,
          groupTitle: group.title,
          categorySlug: category.slug,
          categoryTitle: category.title,
        });
      }
    }
  }
  return rows;
}

/** Deduplicated category options (slug → title) for the filter dropdown. */
export function categoryOptions(
  tree: PublicServiceTree,
): { slug: string; title: string }[] {
  const seen = new Map<string, string>();
  for (const group of tree.groups) {
    for (const category of group.categories) {
      if (!seen.has(category.slug)) seen.set(category.slug, category.title);
    }
  }
  return Array.from(seen, ([slug, title]) => ({ slug, title }));
}

/** Min/max of concrete prices (fixed/from), or null when unusable. */
export function priceBounds(
  rows: PublicServiceRow[],
): { min: number; max: number } | null {
  let min: number | null = null;
  let max: number | null = null;
  for (const row of rows) {
    if (row.priceType === "on_request" || row.price === null) continue;
    min = min === null ? row.price : Math.min(min, row.price);
    max = max === null ? row.price : Math.max(max, row.price);
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

function priceOrd(row: PublicServiceRow): number {
  return row.priceType === "on_request" || row.price === null
    ? Number.POSITIVE_INFINITY
    : row.price;
}

function priceOrdDesc(row: PublicServiceRow): number {
  return row.priceType === "on_request" || row.price === null
    ? Number.POSITIVE_INFINITY
    : -row.price;
}

export function matchesPriceBucket(
  price: number | null,
  priceType: string,
  bucket: PriceBucket | null,
  bounds: { min: number; max: number } | null,
): boolean {
  if (!bucket || !bounds) return true;
  if (priceType === "on_request" || price === null) return false;
  const range = bucketRange(bounds, bucket);
  return price >= range.from && price <= range.to;
}

export function filterRows(
  rows: PublicServiceRow[],
  opts: {
    groupSlug: string | null;
    search: string;
    categorySlug: string | null;
    priceBucket: PriceBucket | null;
    sort: SortKey;
  },
): PublicServiceRow[] {
  const query = opts.search.trim().toLowerCase();
  const bounds = priceBounds(rows);

  const result = rows.filter((row) => {
    if (opts.groupSlug && row.groupSlug !== opts.groupSlug) return false;
    if (opts.categorySlug && row.categorySlug !== opts.categorySlug) return false;
    if (!matchesPriceBucket(row.price, row.priceType, opts.priceBucket, bounds)) {
      return false;
    }
    if (query) {
      const haystack = [row.title, row.shortDesc, row.categoryTitle, row.groupTitle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  if (opts.sort === "priceAsc") result.sort((a, b) => priceOrd(a) - priceOrd(b));
  else if (opts.sort === "priceDesc") result.sort((a, b) => priceOrdDesc(a) - priceOrdDesc(b));
  else result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  return result;
}
