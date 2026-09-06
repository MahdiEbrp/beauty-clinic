import { NextResponse } from "next/server";

import { withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { getPublicCatalog } from "@/lib/services/public-catalog";
import type { Locale } from "@/lib/services/types";
import { localeSchema } from "@/lib/validation/services";

export const runtime = "nodejs";

/**
 * Public (unauthenticated) service catalog feed for the marketing site.
 *
 * Localizes groups and categories for the `locale` query param (defaults to
 * "fa"); the client components fetch this once per page visit.
 */
export const GET = withSecurity<undefined, { locale?: string }>(
  {
    auth: "public",
    rateLimit: {
      limit: 60,
      windowMs: 60 * 1000,
      key: (request) => `catalog:get:${clientIp(request) ?? "unknown"}`,
    },
  },
  async (request) => {
    const queried = new URL(request.url).searchParams.get("locale") ?? "fa";
    const locale: Locale = localeSchema.safeParse(queried).success
      ? (queried as Locale)
      : "fa";
    const catalog = await getPublicCatalog(locale);
    return NextResponse.json(catalog, {
      status: 200,
      headers: {
        "cache-control": "public, max-age=60, s-maxage=60",
      },
    });
  },
);