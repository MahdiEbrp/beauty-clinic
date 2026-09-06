import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CareHubContent from "@/components/CareHubContent";
import { requirePermission } from "@/lib/auth/dal";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/care";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careHub" });

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

export default async function CarePage() {
  await requirePermission("care-guides.read");
  return <CareHubContent />;
}
