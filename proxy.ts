import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "./src/i18n/routing";
import { decryptSession, SESSION_COOKIE } from "./lib/auth/jwt";
import { checkCsrf } from "./lib/middleware/csrf";
import { applyCors, handlePreflight } from "./lib/middleware/cors";
import { proxyRateLimit } from "./lib/middleware/rate-limit";
import { clientIp } from "./lib/api/request";

const handleI18n = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/account"];

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Broad per-IP shield for state-changing requests; stricter per-endpoint
// limits live in the route pipeline (withSecurity) as defense in depth.
const MUTATION_RATE = { limit: 60, windowMs: 15 * 60 * 1000 };

function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (
    parts.length > 1 &&
    (routing.locales as readonly string[]).includes(parts[1])
  ) {
    return `/${parts.slice(2).join("/")}`;
  }
  return pathname;
}

function jsonBlock(
  request: NextRequest,
  code: string,
  message: string,
  status: number,
): NextResponse {
  const response = NextResponse.json({ error: { code, message } }, { status });
  return applyCors(request, response);
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api");

  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  if (MUTATION_METHODS.has(request.method)) {
    if (!checkCsrf(request).ok) {
      return jsonBlock(
        request,
        "CROSS_ORIGIN_FORBIDDEN",
        "Request origin is not allowed.",
        403,
      );
    }

    const ip = clientIp(request) ?? "unknown";
    if (!(await proxyRateLimit(`proxy:${ip}`, MUTATION_RATE.limit, MUTATION_RATE.windowMs))) {
      return jsonBlock(
        request,
        "RATE_LIMITED",
        "Too many attempts. Please try again later.",
        429,
      );
    }
  }

  // API routes bypass i18n middleware entirely; page routes go through it.
  const response = isApi ? NextResponse.next() : handleI18n(request);

  if (!isApi && PROTECTED_PREFIXES.some((prefix) => stripLocale(pathname).startsWith(prefix))) {
    const claims = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!claims) {
      const locale = pathname.split("/")[1];
      const isKnownLocale = (routing.locales as readonly string[]).includes(locale);
      const loginPath = isKnownLocale ? `/${locale}/login` : "/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  return applyCors(request, response);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
