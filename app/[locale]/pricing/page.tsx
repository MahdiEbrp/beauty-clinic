import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PricingContent from "@/components/pricing/PricingContent";
import { getPublicServiceTree } from "@/lib/services/service";
import { getClinicData } from "@/data/clinic";
import type { Locale } from "@/lib/services/types";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/pricing`,
      languages: {
        fa: `${siteUrl}/fa/pricing`,
        en: `${siteUrl}/en/pricing`,
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tree = await getPublicServiceTree(locale as Locale);
  const clinic = await getClinicData(locale as Locale);

  return <PricingContent tree={tree} currency={clinic.currency} />;
}