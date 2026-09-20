import { cacheGet, cacheSet } from "@/lib/cache";

/**
 * Monotonically-increasing version for all public content caches (rules,
 * catalog, service tree).
 *
 * Every public content cache key embeds the current version (e.g.
 * `rules:public:v0:fa`), so a single atomic bump invalidates every versioned
 * entry at once — regardless of which table (rules, prices, groups, categories)
 * the mutation touched.
 *
 * Kept as a standalone module (no `server-only` guard) so both the Next.js app
 * and standalone scripts (the seed, admin jobs) can read/bump it. The guard is
 * applied in `content-version.ts`, which the app imports.
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