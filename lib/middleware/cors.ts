import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000"];

const ALLOW_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOW_HEADERS = "Content-Type,Authorization";

function allowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function requestOrigin(request: { headers: Headers }): string | null {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return null;
  return origin;
}

/**
 * No wildcard, no Origin reflection: the allowlist is read from CORS_ORIGINS
 * (comma-separated) and `Access-Control-Allow-Credentials` is only sent for a
 * matched origin. Unmatched origins get the header omitted entirely.
 */
export function applyCors(
  request: { headers: Headers },
  response: NextResponse,
): NextResponse {
  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");

  const origin = requestOrigin(request);
  if (origin && allowedOrigins().includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  return response;
}

/**
 * Short-circuits CORS preflight requests with a 204 carrying the allowlist
 * headers. Returns null when the request is not a preflight.
 */
export function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method !== "OPTIONS") return null;
  const response = new NextResponse(null, { status: 204 });
  return applyCors(request, response);
}
