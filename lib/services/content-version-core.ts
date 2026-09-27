import { eq, sql } from "drizzle-orm";

import { cacheGet, cacheSet } from "@/lib/cache";
import { db } from "@/src/db";
import { contentVersions } from "@/src/db/schema";

/**
 * Monotonically-increasing version for all public content caches (rules,
 * catalog, service tree, landing, nav).
 *
 * Every public content cache key embeds the current version (e.g.
 * `landing:v7:fa`), so a single bump invalidates every versioned entry at once
 * — regardless of which table the mutation touched.
 *
 * The counter is persisted in Postgres (see `contentVersions`) so a bump is
 * shared by every server instance/process. An in-process-only counter made
 * edited content flip-flop between old and new depending on which instance
 * served a request. A very short read memo keeps the version out of the DB on
 * hot paths while still converging everywhere within a couple of seconds.
 *
 * Kept as a standalone module (no `server-only` guard) so both the Next.js app
 * and standalone scripts (the seed, admin jobs) can read/bump it. The guard is
 * applied in `content-version.ts`, which the app imports.
 */

const VERSION_KEY = "public-content";
const DEFAULT_VERSION = 0;
const MEMO_KEY = "catalog:content-version";
const MEMO_TTL_SECS = 2;

/** Current content version; never throws (fail-open to the default). */
export async function getContentVersion(): Promise<number> {
  const memo = await cacheGet<number>(MEMO_KEY);
  if (typeof memo === "number" && Number.isInteger(memo) && memo >= 0) return memo;
  try {
    const [row] = await db
      .select({ value: contentVersions.value })
      .from(contentVersions)
      .where(eq(contentVersions.key, VERSION_KEY))
      .limit(1);
    const value = Number(row?.value ?? DEFAULT_VERSION);
    await cacheSet(MEMO_KEY, value, MEMO_TTL_SECS);
    return value;
  } catch {
    return DEFAULT_VERSION;
  }
}

/** Advance the content version so all versioned public caches go stale. */
export async function bumpContentVersion(): Promise<number> {
  try {
    const [row] = await db
      .insert(contentVersions)
      .values({ key: VERSION_KEY, value: 1 })
      .onConflictDoUpdate({
        target: contentVersions.key,
        set: { value: sql`${contentVersions.value} + 1`, updatedAt: new Date() },
      })
      .returning({ value: contentVersions.value });
    const value = Number(row?.value ?? 1);
    await cacheSet(MEMO_KEY, value, MEMO_TTL_SECS);
    return value;
  } catch {
    return getContentVersion();
  }
}
