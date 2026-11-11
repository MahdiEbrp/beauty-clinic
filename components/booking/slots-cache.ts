import { fetchAvailableSlots } from "@/components/booking/api";
import type { SlotOption } from "@/components/booking/types";

/**
 * Zero-latency slot feed (rule: "never stare at a loader").
 *
 * Stale-while-revalidate cache keyed by `date`:
 *  - warm cache renders INSTANTLY while a background refresh runs;
 *  - `prefetchDays` warms adjacent days from the day strip;
 *  - `invalidateAll` runs after any submit/cancel/409 so dead slots
 *    disappear without a page reload.
 */

type CacheEntry = {
  data: SlotOption[] | null;
  fetchedAt: number;
  inflight: Promise<SlotOption[]> | null;
};

const TTL_MS = 45 * 1000;
const cache = new Map<string, CacheEntry>();

type SharedSlotQuery = { groupIds: string[]; quantity: number };

function key(date: string, groupId?: string, shared?: SharedSlotQuery): string {
  if (shared) return `${date}::shared:${[...shared.groupIds].sort().join(",")}:${shared.quantity}`;
  return groupId ? `${date}::${groupId}` : date;
}

function load(date: string, groupId: string | undefined, shared?: SharedSlotQuery): Promise<SlotOption[]> {
  const cacheKey = key(date, groupId, shared);
  const entry = cache.get(cacheKey) ?? {
    data: null,
    fetchedAt: 0,
    inflight: null,
  };
  if (!entry.inflight) {
    entry.inflight = fetchAvailableSlots(date, groupId, shared)
      .then((data) => {
        entry.data = data;
        entry.fetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        entry.inflight = null;
        cache.set(cacheKey, entry);
      });
    cache.set(cacheKey, entry);
  }
  return entry.inflight;
}

export type SlotsResult = {
  /** Cached data — may be slightly stale but renders immediately. */
  data: SlotOption[] | null;
  /** Fresh promise, always up to date. */
  fresh: Promise<SlotOption[]>;
  /** True when the cached snapshot was already fresh enough. */
  hit: boolean;
};

/** Read-through cache: returns the instant snapshot plus the fresh promise. */
export function getSlots(date: string, groupId?: string, shared?: SharedSlotQuery): SlotsResult {
  const entry = cache.get(key(date, groupId, shared));
  if (entry?.data && Date.now() - entry.fetchedAt < TTL_MS) {
    return { data: entry.data, fresh: Promise.resolve(entry.data), hit: true };
  }
  if (entry?.data) {
    // stale-while-revalidate: render now, refresh in the background
    void load(date, groupId, shared);
    return { data: entry.data, fresh: load(date, groupId, shared), hit: false };
  }
  return { data: null, fresh: load(date, groupId, shared), hit: false };
}

/** Warm the cache for upcoming days (called from the day strip). */
export function prefetchDays(dates: string[], groupId?: string, shared?: SharedSlotQuery): void {
  for (const date of dates) {
    const entry = cache.get(key(date, groupId, shared));
    if (!entry?.data || Date.now() - entry.fetchedAt > TTL_MS) {
      void load(date, groupId, shared);
    }
  }
}

/** Drop every cached feed (after submit, cancel or a 409 rejection). */
export function invalidateSlots(): void {
  cache.clear();
}