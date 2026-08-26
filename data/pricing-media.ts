/**
 * Shared media helpers for the public catalog.
 *
 * Group/category/service images come from the database; this module only
 * provides a single brand-safe backdrop fallback when no image is set.
 */
import { IMG } from "@/lib/images";

/** Neutral backdrop when a group/category has no image in the database. */
const DEFAULT_IMAGE = IMG.fallback;

/** Resolve a DB image URL, falling back to a single brand-safe backdrop. */
export function pricingImage(image: string | null | undefined): string {
  return image || DEFAULT_IMAGE;
}
