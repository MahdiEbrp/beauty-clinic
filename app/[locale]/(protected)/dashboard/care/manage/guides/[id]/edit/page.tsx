import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateCareGuideForm from "@/components/create-care-guide/CreateCareGuideForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getCareGuide } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/care/manage/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guideWizard" });

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

export default async function EditCareGuidePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("care-guides.write");
  const { id } = await params;
  let guide;
  try {
    guide = await getCareGuide(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <CreateCareGuideForm guide={guide} />;
}
