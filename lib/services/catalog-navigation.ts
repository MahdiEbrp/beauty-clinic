/**
 * Public service group pages show their own treatment details and gallery.
 * Database categories remain available internally for pricing and booking, but
 * are not exposed as a separate public navigation step.
 */
const GROUPS_WITH_PUBLIC_SUBCATEGORIES = new Set<string>();

export function hasPublicSubcategories(groupSlug: string): boolean {
  return GROUPS_WITH_PUBLIC_SUBCATEGORIES.has(groupSlug);
}
