import "server-only";

import { cacheGet, cacheSet } from "@/lib/cache";

/**
 * Single monotonically-increasing version for all public content caches (rules,
 * catalog, service tree).
 *
 * Every public content cache key embeds the current version (e.g.
 * `rules:public:v0:fa`), so a single atomic bump invalidates every versioned
 * entry at once — regardless of which table (rules, prices, groups, categories)
 * the mutation touched. This keeps "invalidating for a new version" a one-line
 * concern and future-proofs any cache key that embeds `getContentsVersion()`.
 *
 * The counter itself is kept in the same shared cache store. Using `incr` on
 * the shared Redis store plus a get/set fallback for the in-memory store keeps
 * the behaviour consistent in tests and single-instance dev.
 */

const CONTENT_VERSION_KEY = "catalog:content-version";
const DEFAULT_VERSION = 0;
// Persist the counter well beyond any content TTL; refreshed on every bump.
const VERSION_TTL_SECS = 60 * 60 * 24 * 365 * 10;

/** Current content version; never throws (fail-open to the default). */
export async function getContentVersion(): Promise<number> {
  const value = await cacheGet<number>(CONTENT_VERSION_KEY);
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : DEFAULT_VERSION;
}

/** Advance the content version so all versioned public caches go stale. */
export async function bumpContentVersion(): Promise<number> {
  const next = (await getContentVersion()) + 1;
  await cacheSet(CONTENT_VERSION_KEY, next, VERSION_TTL_SECS);
  return next;
}
