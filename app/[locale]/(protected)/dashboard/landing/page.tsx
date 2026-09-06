import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LandingHub from "@/components/landing-admin/LandingHub";
import { requirePermission } from "@/lib/auth/dal";
import { getLandingAdminOverview } from "@/lib/landing/admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingAdmin" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
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

export default async function LandingDashboardPage() {
  await requirePermission("services.read");
  const overview = await getLandingAdminOverview();

  return <LandingHub overview={overview} />;
}