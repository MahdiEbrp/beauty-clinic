import type { EntryMeta } from "./types";

export interface CachedListing {
  entries: EntryMeta[];
  fetchedAt: number;
  seq: number;
}

/**
 * How long a listing is served from cache before a background refetch is
 * triggered. Browsing a recently visited folder is instant, but shows fresh
 * data within a second during the background refresh.
 */
export const FILES_CACHE_TTL_MS = 10_000;

/**
 * Maximum number of folder listings kept in memory. Bounded so long browsing
 * sessions never grow the cache without limit.
 */
export const FILES_CACHE_MAX = 256;

export function isFresh(item: CachedListing, ttlMs: number, now = Date.now()): boolean {
  return now - item.fetchedAt <= ttlMs;
}

/**
 * Shared store of folder listings keyed by relative path. The file browser
 * targets a public folder, so cache keys hold no per-user information and the
 * cache is safe to share across every viewer. Kept a plain module singleton so
 * back/forward navigation between folders stays instant for the whole session.
 */
export class FilesCache {
  private store = new Map<string, CachedListing>();
  private seqCounter = 0;

  get(path: string): CachedListing | undefined {
    const item = this.store.get(path);
    if (item) {
      // Touch to keep the entry most-recently-used.
      this.store.delete(path);
      this.store.set(path, item);
    }
    return item;
  }

  set(path: string, entries: EntryMeta[]): void {
    this.store.delete(path);
    this.store.set(path, { entries, fetchedAt: Date.now(), seq: ++this.seqCounter });
    if (this.store.size > FILES_CACHE_MAX) {
      const oldest = this.store.keys().next().value as string | undefined;
      if (oldest !== undefined) this.store.delete(oldest);
    }
  }

  invalidate(path: string): void {
    this.store.delete(path);
  }

  invalidateAll(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const filesCache = new FilesCache();