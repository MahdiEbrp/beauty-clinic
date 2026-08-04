import { Redis } from "@upstash/redis";

import { logError } from "@/lib/log";

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

/**
 * Shared rate limiter used by both API route handlers (Node) and the proxy
 * (Edge). When the environment points at a Redis-compatible store (Vercel KV
 * or Upstash), limits are enforced across every serverless instance via a
 * fixed-window INCR/EXPIRE counter. Without those env vars (local dev, tests)
 * it falls back to an in-process sliding window, which is single-instance only.
 */
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const hasSharedStore = Boolean(REDIS_URL && REDIS_TOKEN);

let redis: Redis | undefined;
let warnedAboutFallback = false;

function sharedClient(): Redis | null {
  if (!hasSharedStore) {
    if (!warnedAboutFallback && process.env.NODE_ENV === "production") {
      warnedAboutFallback = true;
      logError("ratelimit.in_memory_fallback", {
        reason: "KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN not configured",
      });
    }
    return null;
  }
  redis ??= new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
  return redis;
}

// --- In-memory fallback (single instance) --------------------------------

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    buckets.clear();
  }

  const windowStart = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] as number[] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    const retryAfterMs = Math.max(bucket.timestamps[0] + windowMs - now, 0);
    return { allowed: false, retryAfterMs };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterMs: 0 };
}

// --- Shared (Redis) store -------------------------------------------------
//
// Fixed-window counter: INCR, and the first caller arms the EXPIRE so the
// window resets windowMs after the first request in it. Boundary bursts
// (requests at the tail of one window and the head of the next) are a known,
// accepted tradeoff of fixed windows vs. the old single-instance sliding
// window.

async function redisRateLimit(
  client: Redis,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  const windowSecs = Math.max(1, Math.ceil(windowMs / 1000));

  // INCR + EXPIRE-NX in one roundtrip: the first request in a window arms the
  // TTL, and a network blip between commands can't orphan an unexpiring key.
  const pipe = client.pipeline();
  pipe.incr(redisKey);
  pipe.expire(redisKey, windowSecs, "NX");
  const [current] = await pipe.exec<[number, number]>();

  if ((current ?? 0) <= limit) {
    return { allowed: true, retryAfterMs: 0 };
  }

  const ttl = await client.ttl(redisKey);
  const retryAfterMs = ttl > 0 ? ttl * 1000 : windowSecs * 1000;
  return { allowed: false, retryAfterMs };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const client = sharedClient();
  if (!client) return memoryRateLimit(key, limit, windowMs);

  try {
    return await redisRateLimit(client, key, limit, windowMs);
  } catch (error) {
    logError("ratelimit.store_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Fail open: a store outage must not lock every user out of the app.
    return { allowed: true, retryAfterMs: 0 };
  }
}

/** Boolean convenience used by the edge proxy, e.g. `await proxyRateLimit(...)`. */
export async function proxyRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  return (await rateLimit(key, limit, windowMs)).allowed;
}
