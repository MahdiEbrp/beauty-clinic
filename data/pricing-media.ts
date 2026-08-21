/**
 * Estimated treatment durations (minutes) by service group.
 *
 * The seed does not carry per-service durations yet, so the public pricing
 * cards fall back to a group-level estimate. Images are intentionally NOT
 * listed here — group/category images come from the database
 * (`service_groups.image` / `service_categories.image`).
 */
import { IMG } from "@/lib/images";

const GROUP_DURATION: Record<string, number> = {
  "face-filler": 45,
  "full-face-filler": 60,
  "body-filler": 60,
  "botox-enzyme-treatments": 25,
  "mesotherapy-skin-rejuvenation": 45,
  "laser-hair-removal": 30,
  "tattoo-removal-skin-brightening": 30,
  "skin-care": 45,
  hifu: 60,
};

export function groupDurationMin(slug: string | null): number {

  return (slug ? GROUP_DURATION[slug] : undefined) ?? 45;
}

/** Neutral backdrop when a group/category has no image in the database. */
const DEFAULT_IMAGE = IMG.fallback;

/** Resolve a DB image URL, falling back to a single brand-safe backdrop. */
export function pricingImage(image: string | null | undefined): string {
  return image || DEFAULT_IMAGE;
}
