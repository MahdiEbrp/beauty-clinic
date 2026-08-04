/**
 * API-side rate limiter (Node runtime).
 *
 * Backed by a shared Redis store when configured (Vercel KV / Upstash), with
 * an in-process fallback for local dev and tests. See lib/rate-limit.ts.
 */
export { rateLimit } from "@/lib/rate-limit";
export type { RateLimitResult } from "@/lib/rate-limit";
