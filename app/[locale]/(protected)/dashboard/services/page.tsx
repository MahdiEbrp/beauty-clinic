import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServicesAnalyticsContent from "@/components/ServicesAnalyticsContent";
import { requirePermission } from "@/lib/auth/dal";
import { getPerformanceView } from "@/lib/services/performance";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesAnalytics" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/dashboard/services`,
      languages: {
        fa: `${siteUrl}/fa/dashboard/services`,
        en: `${siteUrl}/en/dashboard/services`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function ServicesPage() {
  await requirePermission("services.read");
  const data = await getPerformanceView();

  return <ServicesAnalyticsContent data={data} />;
}
