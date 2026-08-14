import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServicesContent from "@/ServicesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listServices } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "serviceServices" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}${ROUTE}`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}`,
        en: `${siteUrl}/en${ROUTE}`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function ManageServicesPage() {
  const session = await requirePermission("services.read");
  const initialData = await listServices({ page: 1, perPage: 10 });
  return <ServicesContent user={session.user} initialData={initialData} />;
}

