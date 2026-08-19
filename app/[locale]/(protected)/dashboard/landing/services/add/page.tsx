import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LandingItemForm from "@/components/landing-admin/LandingItemForm";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/services/add";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingForm" });

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

export default async function AddLandingservicesPage() {
  await requirePermission("services.write");

  return <LandingItemForm collection="services" />;
}
