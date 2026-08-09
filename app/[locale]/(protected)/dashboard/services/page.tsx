import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requirePermission } from "@/lib/auth/dal";
import { getCatalogSummary, listServices } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";
import ServicesCatalogContent from "@/components/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesCatalog" });

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
  const session = await requirePermission("services.read");
  const [initialData, summary] = await Promise.all([
    listServices({ page: 1, perPage: 10 }),
    getCatalogSummary(),
  ]);

  return (
    <ServicesCatalogContent
      user={session.user}
      initialData={initialData}
      summary={summary}
    />
  );
}
