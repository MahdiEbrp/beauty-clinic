import "server-only";

import { cache } from "react";
import { asc } from "drizzle-orm";

import { cacheDel, cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import { slotPatterns } from "@/src/db/schema";

export const SLOT_PATTERNS_CACHE_KEY = "slot-patterns";

/** One explicit (start time → capacity) entry for a weekday. */
export type SlotPattern = {
  day: string;
  startTime: string;
  capacity: number;
};

/** The row shape persisted in the `slot_patterns` table. */
type SlotPatternRow = typeof slotPatterns.$inferSelect;

function toPattern(row: SlotPatternRow): SlotPattern {
  return {
    day: row.day,
    startTime: row.startTime.slice(0, 5),
    capacity: row.capacity,
  };
}

/** Bust the cached pattern set after any admin mutation. */
export async function bustSlotPatternCache(): Promise<void> {
  await cacheDel(SLOT_PATTERNS_CACHE_KEY);
}

/** Every pattern row from the DB (no cache). */
async function loadPatternsRaw(): Promise<SlotPattern[]> {
  const rows = await db
    .select()
    .from(slotPatterns)
    .orderBy(asc(slotPatterns.day), asc(slotPatterns.startTime));
  return rows.map(toPattern);
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