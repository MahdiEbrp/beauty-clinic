import "server-only";

import { cache } from "react";
import { asc, inArray } from "drizzle-orm";

import { cacheDel, cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import { slotPatternGroups, slotPatterns } from "@/src/db/schema";

export const SLOT_PATTERNS_CACHE_KEY = "slot-patterns";

/** One explicit (start time → capacity + groups) entry for a weekday. */
export type SlotPattern = {
  day: string;
  startTime: string;
  capacity: number;
  /** Linked service groups; empty = generated slot accepts every group. */
  groupIds: string[];
};

/** The row shape persisted in the `slot_patterns` table. */
type SlotPatternRow = typeof slotPatterns.$inferSelect;

function toPattern(row: SlotPatternRow, groupIds: string[]): SlotPattern {
  return {
    day: row.day,
    startTime: row.startTime.slice(0, 5),
    capacity: row.capacity,
    groupIds,
  };
}

/** Bust the cached pattern set after any admin mutation. */
export async function bustSlotPatternCache(): Promise<void> {
  await cacheDel(SLOT_PATTERNS_CACHE_KEY);
}

/** Every pattern row from the DB (no cache) with its group links. */
async function loadPatternsRaw(): Promise<SlotPattern[]> {
  const rows = await db
    .select()
    .from(slotPatterns)
    .orderBy(asc(slotPatterns.day), asc(slotPatterns.startTime));
  if (rows.length === 0) return [];

  // One batched link query for every pattern in the set (no N+1).
  const links = await db
    .select({
      patternId: slotPatternGroups.patternId,
      groupId: slotPatternGroups.groupId,
    })
    .from(slotPatternGroups)
    .where(inArray(slotPatternGroups.patternId, rows.map((row) => row.id)));
  const byPattern = new Map<string, string[]>();
  for (const link of links) {
    const list = byPattern.get(link.patternId);
    if (list) list.push(link.groupId);
    else byPattern.set(link.patternId, [link.groupId]);
  }

  return rows.map((row) => toPattern(row, byPattern.get(row.id) ?? []));
}

/**
 * All per-weekday patterns, cached as near-static data. Any failure yields an
 * empty map so generation degrades to plain window/interval slots rather than
 * crashing on a missing migration.
 */
export const loadSlotPatternRecords = cache(async (): Promise<SlotPattern[]> => {
  try {
    return await cacheWrap(SLOT_PATTERNS_CACHE_KEY, 600, loadPatternsRaw);
  } catch {
    return [];
  }
});

/** Patterns grouped by weekday (empty array = weekday is not in pattern mode). */
export async function loadSlotPatternMap(): Promise<Map<string, SlotPattern[]>> {
  const records = await loadSlotPatternRecords();
  const map = new Map<string, SlotPattern[]>();
  for (const pattern of records) {
    const list = map.get(pattern.day);
    if (list) list.push(pattern);
    else map.set(pattern.day, [pattern]);
  }
  return map;
}