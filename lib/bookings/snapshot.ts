import { eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { serviceGroups, serviceGroupsI18n } from "@/src/db/schema";
import type { Locale } from "@/lib/services/types";

export type GroupSnapshot = {
  title: string;
};

/**
 * Batched service-group snapshots for a whole order (one query, no N+1).
 * Only the localized group title is snapshotted — service prices are never
 * stored or shown; checkout charges the single fixed deposit from settings.
 * Falls back to the other locale when the requested one is missing.
 */
export async function snapshotGroups(
  groupIds: string[],
  locale: Locale,
): Promise<Map<string, GroupSnapshot>> {
  const map = new Map<string, GroupSnapshot>();
  const unique = [...new Set(groupIds)];
  if (unique.length === 0) return map;

  const rows = await db
    .select({
      id: serviceGroups.id,
      title: serviceGroupsI18n.name,
      rowLocale: serviceGroupsI18n.locale,
      isActive: serviceGroups.isActive,
    })
    .from(serviceGroups)
    .innerJoin(serviceGroupsI18n, eq(serviceGroupsI18n.groupId, serviceGroups.id))
    .where(inArray(serviceGroups.id, unique));

  const active = new Map<string, boolean>();
  const preferred = new Map<string, string>();
  const fallback = new Map<string, string>();
  for (const row of rows) {
    active.set(row.id, row.isActive);
    if (row.rowLocale === locale) preferred.set(row.id, row.title);
    else if (!fallback.has(row.id)) fallback.set(row.id, row.title);
  }

  for (const id of unique) {
    if (active.get(id) === false) {
      throw new ApiError(409, "GROUP_UNAVAILABLE", "This group is not available for booking.");
    }
    const title = preferred.get(id) ?? fallback.get(id);
    if (title === undefined) throw new ApiError(404, "GROUP_NOT_FOUND", "Group not found.");
    map.set(id, { title });
  }
  return map;
}
