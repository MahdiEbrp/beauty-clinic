type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/**
 * Best-effort sliding-window limiter for middleware (edge runtime).
 *
 * Edge functions are ephemeral and per-instance, so this is NOT a reliable
 * cross-instance limiter — for horizontally scaled deployments pair it with a
 * shared store (Upstash, Vercel KV). It still provides a cheap shield against
 * trivial floods on a single instance (e.g. local dev, single-node hosting).
 */
export function proxyRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    buckets.clear();
  }

  const windowStart = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] as number[] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}
