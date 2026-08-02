import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "./src/i18n/routing";
import { decryptSession, SESSION_COOKIE } from "./lib/auth/jwt";

const handleI18n = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/account"];

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const claims = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!claims) {
      const locale = pathname.split("/")[1];
      const isKnownLocale = (routing.locales as readonly string[]).includes(locale);
      const loginPath = isKnownLocale ? `/${locale}/login` : "/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
