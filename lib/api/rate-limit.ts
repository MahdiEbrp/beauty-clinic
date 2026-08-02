/**
 * In-memory sliding-window rate limiter, keyed by string (e.g. `login:<ip>`).
 *
 * Suitable for single-instance deployments and local development. For
 * horizontally scaled production, replace with a shared store (Upstash Redis,
 * Vercel KV, etc.) using the same API shape.
 */
type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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
