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

function key(date: string, serviceId?: string): string {
  return serviceId ? `${date}::${serviceId}` : date;
}

function load(date: string, serviceId: string | undefined): Promise<SlotOption[]> {
  const entry = cache.get(key(date, serviceId)) ?? {
    data: null,
    fetchedAt: 0,
    inflight: null,
  };
  if (!entry.inflight) {
    entry.inflight = fetchAvailableSlots(date, serviceId)
      .then((data) => {
        entry.data = data;
        entry.fetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        entry.inflight = null;
        cache.set(key(date, serviceId), entry);
      });
    cache.set(key(date, serviceId), entry);
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
export function getSlots(date: string, serviceId?: string): SlotsResult {
  const entry = cache.get(key(date, serviceId));
  if (entry?.data && Date.now() - entry.fetchedAt < TTL_MS) {
    return { data: entry.data, fresh: Promise.resolve(entry.data), hit: true };
  }
  if (entry?.data) {
    // stale-while-revalidate: render now, refresh in the background
    void load(date, serviceId);
    return { data: entry.data, fresh: load(date, serviceId), hit: false };
  }
  return { data: null, fresh: load(date, serviceId), hit: false };
}

/** Warm the cache for upcoming days (called from the day strip). */
export function prefetchDays(dates: string[], serviceId?: string): void {
  for (const date of dates) {
    const entry = cache.get(key(date, serviceId));
    if (!entry?.data || Date.now() - entry.fetchedAt > TTL_MS) {
      void load(date, serviceId);
    }
  }
}

/** Drop every cached feed (after submit, cancel or a 409 rejection). */
export function invalidateSlots(): void {
  cache.clear();
}