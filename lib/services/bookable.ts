import type { Locale } from "./types";

/**
 * Curated booking-picker list (step 1 of the booking wizard).
 *
 * The booking list is a hand-picked subset of the catalog, rendered as a flat
 * set of tickable items — per the clinic's request, in their exact order, with
 * no descriptions or service counts. `label` overrides the catalog group title
 * for the row (used to merge several catalog groups into one bookable item).
 */
export type BookableItem = {
  slug: string;
  label?: Partial<Record<Locale, string>>;
};

export const BOOKABLE_ITEMS: readonly BookableItem[] = [
  { slug: "face-filler" },
  { slug: "full-face-filler" },
  { slug: "body-filler" },
  { slug: "botox" },
  { slug: "enzyme" },
  {
    slug: "meso-gel-rejuvenation",
    label: {
      fa: "مزوژل، مزوتراپی، تقویت مو، جوانساز",
      en: "Mesogel, Mesotherapy, Hair & Rejuvenation",
    },
  },
  { slug: "face-thread-lift" },
  { slug: "laser-hair-removal" },
  { slug: "hifu" },
  { slug: "tattoo-removal-skin-brightening" },
];

const BOOKABLE_BY_SLUG = new Map(BOOKABLE_ITEMS.map((item) => [item.slug, item]));

/** True when the group is part of the booking picker list. */
export function isBookableGroup(slug: string): boolean {
  return BOOKABLE_BY_SLUG.has(slug);
}

/** Optional row-label override for a bookable group (merged items). */
export function bookingLabelFor(slug: string, locale: Locale): string | undefined {
  return BOOKABLE_BY_SLUG.get(slug)?.label?.[locale];
}
