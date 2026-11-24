/**
 * Only these three service groups have a customer-visible subcategory step.
 * Other groups still keep one internal category because every billable service
 * belongs to a category in the database, but that implementation detail is
 * hidden from public navigation and the group landing page.
 */
const GROUPS_WITH_PUBLIC_SUBCATEGORIES = new Set([
  "face-filler",
  "sensitive-filler",
  "botox",
]);

export function hasPublicSubcategories(groupSlug: string): boolean {
  return GROUPS_WITH_PUBLIC_SUBCATEGORIES.has(groupSlug);
}
