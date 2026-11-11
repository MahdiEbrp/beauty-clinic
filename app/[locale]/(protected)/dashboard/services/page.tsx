import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServicesAnalyticsContent from "@/components/ServicesAnalyticsContent";
import { requirePermission } from "@/lib/auth/dal";
import { getPerformanceView } from "@/lib/services/performance";
import { getCatalogSummary } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

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
      canonical: pageUrl(locale, "/dashboard/services"),
      languages: {
        fa: pageUrl("fa", "/dashboard/services"),
        en: pageUrl("en", "/dashboard/services"),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function ServicesPage() {
  const session = await requirePermission("services.read");
  const [data, catalog] = await Promise.all([getPerformanceView(), getCatalogSummary()]);

  return (
    <ServicesAnalyticsContent
      data={data}
      catalog={catalog}
      canWrite={session.user.permissions.includes("services.write")}
    />
  );
}
