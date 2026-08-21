import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CareGuidesContent from "@/components/CareGuidesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listCareGuidesAdmin } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/care/manage/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careGuides" });

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

export default async function ManageCareGuidesPage() {
  const session = await requirePermission("care-guides.read");
  const initialData = await listCareGuidesAdmin({ page: 1, perPage: 10 });

  return <CareGuidesContent user={session.user} initialData={initialData} />;
}
