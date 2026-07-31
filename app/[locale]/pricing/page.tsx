import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/site";
import PricingContent from "@/components/PricingContent";

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

export default function PricingPage() {
  return <PricingContent />;
}
