import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CareGuideItemsContent from "@/components/CareGuideItemsContent";
import { requirePermission } from "@/lib/auth/dal";
import { listCareGuideItemsAdmin, listGuideOptions } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/care/manage/items";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careGuideItems" });

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

export default async function ManageCareGuideItemsPage() {
  const session = await requirePermission("care-guides.read");
  const [initialData, guideOptions] = await Promise.all([
    listCareGuideItemsAdmin({ page: 1, perPage: 10 }),
    listGuideOptions(),
  ]);

  return (
    <CareGuideItemsContent
      user={session.user}
      initialData={initialData}
      guideOptions={guideOptions}
    />
  );
}
