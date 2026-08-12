import { Redis } from "@upstash/redis";

import { logError } from "@/lib/log";

/**
 * Shared read cache used to keep hot, read-mostly data (public catalog, system
 * settings) out of the Postgres round-trip path.
 *
 * Backed by a shared Redis-compatible store (Vercel KV / Upstash) when the KV
 * or Upstash env vars are configured, exactly like the rate limiter in
 * lib/rate-limit.ts. Without those vars (local dev, tests) it falls back to an
 * in-process TTL store so the caching behavior still applies on a single
 * instance.
 *
 * Values are JSON-serialized, so only JSON-safe payloads should be cached
 * (plain objects/arrays/strings/numbers/null/booleans). Never cache objects
 * that rely on Date/native class identity, as those come back as strings on a
 * hit.
 */

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const hasSharedStore = Boolean(REDIS_URL && REDIS_TOKEN);

let redis: Redis | undefined;

function sharedClient(): Redis | null {
  if (!hasSharedStore) return null;
  const url = REDIS_URL ?? (() => { throw new Error("REDIS_URL is not set"); })();
  const token = REDIS_TOKEN ?? (() => { throw new Error("REDIS_TOKEN is not set"); })();
  redis ??= new Redis({ url, token });
  return redis;
}

// --- In-memory fallback (single instance) ----------------------------------

type Entry = { value: unknown; expiresAt: number };

const store = new Map<string, Entry>();
const MAX_ENTRIES = 10_000;

function memoryGet(key: string): unknown | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function memorySet(key: string, value: unknown, ttlSecs: number): void {
  if (store.size >= MAX_ENTRIES) store.clear();
  store.set(key, { value, expiresAt: Date.now() + ttlSecs * 1000 });
}

function memoryDel(key: string): void {
  store.delete(key);
}

// --- Serialization ----------------------------------------------------------

/** Returns undefined when the value can't be safely stored (e.g. undefined). */
function serialize(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  try {
    return JSON.stringify(value) ?? undefined;
  } catch {
    return undefined;
  }
}

function deserialize<T>(raw: string | null | undefined): T | undefined {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

// --- Public API -------------------------------------------------------------

/**
 * Drop all in-flight dedupe state and the in-memory store. Intended for tests
 * that reset a mocked data source between cases so a stale cache entry for one
 * key can't leak into the next test. No-op for production callers.
 */
export function resetCacheForTests(): void {
  inflight.clear();
  store.clear();
}

/** Read a cached value, or undefined on a miss or store error (fail-open). */
export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const client = sharedClient();
  if (!client) {
    const value = memoryGet(key);
    return value === undefined ? undefined : (value as T);
  }
  try {
    return deserialize<T>(await client.get<string>(key));
  } catch (error) {
    logError("cache.get_error", { key, error: error instanceof Error ? error.message : String(error) });
    return undefined;
  }
}

/** Store a JSON-safe value with a TTL. Silently ignores non-serializable values. */
export async function cacheSet(key: string, value: unknown, ttlSecs: number): Promise<void> {
  const raw = serialize(value);
  if (raw === undefined) return;
  const client = sharedClient();
  if (!client) {
    memorySet(key, value, ttlSecs);
    return;
  }
  try {
    await client.set(key, raw, { ex: ttlSecs });
  } catch (error) {
    logError("cache.set_error", { key, error: error instanceof Error ? error.message : String(error) });
  }
}

/** Delete a key so the next read re-computes from the source of truth. */
export async function cacheDel(key: string): Promise<void> {
  const client = sharedClient();
  if (!client) {
    memoryDel(key);
    return;
  }
  try {
    await client.del(key);
  } catch (error) {
    logError("cache.del_error", { key, error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Return a cached value or compute it, store it, and return it.
 *
 * A per-key in-flight promise prevents a stampede when many requests miss the
 * same key at once (common under serverless concurrency), so the underlying
 * producer (DB query) runs at most once per TTL window.
 *
 * NOTE: only use when the produced value is guaranteed non-undefined. Caching
 * an explicit undefined value is not supported — callers should model "empty"
 * as e.g. an empty array/object.
 */
const inflight = new Map<string, Promise<unknown>>();

export async function cacheWrap<T>(key: string, ttlSecs: number, fn: () => Promise<T>): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const value = await fn();
      await cacheSet(key, value, ttlSecs);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
