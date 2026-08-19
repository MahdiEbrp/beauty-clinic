import { NextResponse } from "next/server";

import { withSecurity } from "@/lib/api/security";
import { getPublicLanding } from "@/lib/landing";
import type { Locale } from "@/lib/services/types";
import { localeSchema } from "@/lib/validation/services";

export const runtime = "nodejs";

/**
 * Public (unauthenticated) landing-page content feed for the marketing site.
 *
 * Localizes every landing section for the `locale` query param (defaults to
 * "fa"). The landing components fetch this once per page visit.
 */
export const GET = withSecurity<undefined, { locale?: string }>(
  { auth: "public" },
  async (request) => {
    const queried = new URL(request.url).searchParams.get("locale") ?? "fa";
    const locale: Locale = localeSchema.safeParse(queried).success
      ? (queried as Locale)
      : "fa";
    const landing = await getPublicLanding(locale);
    return NextResponse.json(landing, {
      status: 200,
      headers: {
        "cache-control": "public, max-age=60, s-maxage=60",
      },
    });
  },
);
