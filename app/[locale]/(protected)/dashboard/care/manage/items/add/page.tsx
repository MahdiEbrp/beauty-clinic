import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CreateCareGuideItemForm from "@/components/create-care-guide-item/CreateCareGuideItemForm";
import { requirePermission } from "@/lib/auth/dal";
import { listGuideOptions } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/care/manage/items/add";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guideItemWizard" });

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

export default async function AddCareGuideItemPage() {
  await requirePermission("care-guides.write");
  const guideOptions = await listGuideOptions();

  return <CreateCareGuideItemForm guideOptions={guideOptions} />;
}
