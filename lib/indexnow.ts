/**
 * IndexNow — immediate notification to Bing (and every other participating
 * engine) that a URL changed.
 *
 * A single POST to the shared `api.indexnow.org` endpoint fans out to all
 * participating search engines, so one call covers Bing, Yandex and the rest.
 * Without it, a price edit or a new service takes as long as the next crawl
 * cycle to become visible; with it, minutes.
 *
 * Two properties matter more than anything else here:
 *
 * 1. **Never throw into the caller's transaction.** Every entry point is
 *    fire-and-forget: a 429 or a network blip must not roll back the admin edit
 *    that triggered the notification. Failures are logged, not thrown.
 * 2. **Never submit more than the protocol allows.** IndexNow answers 429 to
 *    excessive submissions, and repeated 429s can get a key throttled, so
 *    submissions are deduplicated through the KV cache before they leave.
 *
 * Ownership is proven by a key file at the domain root (`public/<key>.txt`).
 * Without it the endpoint answers 403 and every submission is wasted, which is
 * why a missing `INDEXNOW_KEY` short-circuits to a no-op instead.
 */

import "server-only";

import { cacheGet, cacheSet } from "@/lib/cache";
import { logError, logInfo } from "@/lib/log";
import { siteUrl } from "@/lib/site";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Protocol maximum per POST. */
const MAX_URLS_PER_REQUEST = 10_000;

/** Network budget for a single notification POST. */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Retained-for-submission window. One dedupe key per URL per window, so a burst
 * of edits collapses to one submission while a later edit still gets through.
 */
const DEDUPE_TTL_SECS = 30 * 60;

const DEDUPE_PREFIX = "indexnow:pending";

function key(): string | null {
  const value = process.env.INDEXNOW_KEY?.trim();
  return value && /^[A-Za-z0-9-]{8,128}$/.test(value) ? value : null;
}

export function indexNowConfigured(): boolean {
  return key() !== null;
}

/** True when the daily full-sitemap sweep should run. */
export function indexNowSweepEnabled(): boolean {
  const flag = process.env.INDEXNOW_ENABLED?.trim();
  return flag ? flag !== "false" : process.env.NODE_ENV !== "development";
}

function dedupeKeyFor(url: string): string {
  // Hashing keeps the cache key bounded and safe for any URL shape.
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return `${DEDUPE_PREFIX}:${(hash >>> 0).toString(36)}`;
}

/** Drops duplicates and anything already submitted inside the dedupe window. */
async function filterUnsubmitted(urls: string[]): Promise<string[]> {
  const unique = Array.from(new Set(urls));
  const fresh: string[] = [];
  for (const url of unique) {
    if (await cacheGet<boolean>(dedupeKeyFor(url))) continue;
    fresh.push(url);
  }
  return fresh;
}

async function markSubmitted(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map((url) => cacheSet(dedupeKeyFor(url), true, DEDUPE_TTL_SECS)),
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

/** Absolute origin IndexNow expects in the `host` field (no path, no www coercion). */
function indexNowHost(): string {
  return new URL(siteUrl).host;
}

async function postBatch(urlList: string[], apiKey: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: indexNowHost(),
        key: apiKey,
        keyLocation: `${siteUrl}/${apiKey}.txt`,
        urlList,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    // 200 = accepted, 202 = received with key validation pending. Both fine;
    // 202 is normal on the very first submission after the key file appears.
    if (response.status === 200 || response.status === 202) return true;
    logError("indexnow.rejected", {
      status: response.status,
      count: urlList.length,
    });
    return false;
  } catch (error) {
    logError("indexnow.failed", {
      count: urlList.length,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fire-and-forget submission. Safe to call from a mutation that is already
 * inside a transaction: it never throws and never awaits on failure.
 *
 * @param paths Absolute URLs or locale-relative app paths. Relative paths are
 *   expanded into every locale variant so a fa-only edit still notifies the en
 *   URL (and vice versa).
 */
export async function notifyIndexNow(
  paths: readonly (string | URL)[],
  context: Record<string, unknown> = {},
): Promise<void> {
  const apiKey = key();
  if (!apiKey || paths.length === 0) return;

  const urls: string[] = [];
  for (const entry of paths) {
    if (entry instanceof URL) {
      urls.push(entry.toString());
      continue;
    }
    if (/^https?:\/\//i.test(entry)) {
      urls.push(entry);
      continue;
    }
    // Locale-relative path: submit every locale variant of it.
    const { routing } = await import("@/src/i18n/routing");
    const { pageUrl } = await import("@/lib/site");
    for (const locale of routing.locales) urls.push(pageUrl(locale, entry));
  }

  const fresh = await filterUnsubmitted(urls);
  if (fresh.length === 0) return;

  const results = await Promise.all(
    chunk(fresh, MAX_URLS_PER_REQUEST).map((batch) => postBatch(batch, apiKey)),
  );

  const accepted = results.filter(Boolean).length;
  if (accepted > 0) {
    await markSubmitted(fresh);
    logInfo("indexnow.submitted", {
      urls: fresh.length,
      batches: results.length,
      ...context,
    });
  }
}

/**
 * Safety net for the targeted calls: re-submits the entire sitemap once a day.
 *
 * Targeted notifications fire from the mutation layer, which means any path that
 * edits content without going through it (a direct SQL fix, a restored backup, a
 * deployment that changes metadata site-wide) would never be announced. The
 * sweep also repairs the case where a targeted POST failed while the endpoint was
 * rate limiting, because only successful submissions are marked as sent.
 */
export async function submitSitemapToIndexNow(): Promise<void> {
  const apiKey = key();
  if (!apiKey) return;

  const { routing } = await import("@/src/i18n/routing");
  const { pageUrl } = await import("@/lib/site");
  const [{ getGroupCatalog }, { getCategoryCatalog }] = await Promise.all([
    import("@/lib/services/group-page"),
    import("@/lib/services/category-page"),
  ]);

  const urls: string[] = [];
  for (const locale of routing.locales) {
    for (const page of ["/", "/pricing", "/services", "/care", "/rules", "/booking"]) {
      urls.push(pageUrl(locale, page));
    }
    // The nav catalog is the same cached feed the navbar uses, so the sweep
    // costs no additional database work in the common case.
    for (const group of await getGroupCatalog(locale)) {
      urls.push(pageUrl(locale, `/services/${group.groupSlug}`));
    }
    for (const category of await getCategoryCatalog(locale)) {
      urls.push(
        pageUrl(locale, `/services/${category.groupSlug}/${category.categorySlug}`),
      );
    }
  }

  // The sweep deliberately bypasses the dedupe window: re-announcing the whole
  // sitemap is the point, and IndexNow treats a re-submission of an unchanged
  // URL as a no-op.
  const results = await Promise.all(
    chunk(urls, MAX_URLS_PER_REQUEST).map((batch) => postBatch(batch, apiKey)),
  );

  logInfo("indexnow.sweep", {
    urls: urls.length,
    batches: results.length,
    accepted: results.filter(Boolean).length,
  });
}