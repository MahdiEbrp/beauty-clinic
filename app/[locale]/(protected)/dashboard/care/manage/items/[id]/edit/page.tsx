import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateCareGuideItemForm from "@/components/create-care-guide-item/CreateCareGuideItemForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getCareGuideItem, listGuideOptions } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/care/manage/items";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guideItemWizard" });

  return {
    title: t("metaEdit.title"),
    description: t("metaEdit.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}${ROUTE}/edit`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}/edit`,
        en: `${siteUrl}/en${ROUTE}/edit`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditCareGuideItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("care-guides.write");
  const { id } = await params;
  const [item, guideOptions] = await Promise.all([
    getCareGuideItem(id).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    listGuideOptions(),
  ]);
  if (!item) notFound();

  return <CreateCareGuideItemForm item={item} guideOptions={guideOptions} />;
}
