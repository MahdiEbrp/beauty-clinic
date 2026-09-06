import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingCollectionContent } from "@/components/landing-admin/landing-collection";
import { requirePermission } from "@/lib/auth/dal";
import { listCollectionRows } from "@/lib/landing/admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/stats";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingAdmin" });

  return {
    title: t("collections.stats.metaTitle"),
    description: t("collections.stats.metaDescription"),
    alternates: {
      canonical: pageUrl(locale, `${ROUTE}`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}`),
        en: pageUrl("en", `${ROUTE}`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function LandingstatsPage() {
  const session = await requirePermission("services.read");
  const initialData = await listCollectionRows("stats", { page: 1, perPage: 10 });

  return (
    <LandingCollectionContent
      collection="stats"
      user={session.user}
      initialData={initialData}
    />
  );
}
