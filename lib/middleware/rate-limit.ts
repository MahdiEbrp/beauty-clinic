/**
 * Edge-proxy rate limiter.
 *
 * Backed by the same shared Redis store as the API limiter so proxy and route
 * limits compose across serverless instances. Falls back to an in-process
 * store when no Redis env vars are configured. See lib/rate-limit.ts.
 */
export { proxyRateLimit } from "@/lib/rate-limit";
