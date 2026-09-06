import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PricingArticle from "@/components/pricing/article/PricingArticle";
import { getPricingPage } from "@/lib/services/pricing-page";
import { pageUrl } from "@/lib/site";
import type { Locale } from "@/lib/services/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  const data = await getPricingPage(locale as Locale);

  return {
    title: data.seo.title || t("meta.title"),
    description: data.seo.description || t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, "/pricing"),
      languages: {
        fa: pageUrl("fa", "/pricing"),
        en: pageUrl("en", "/pricing"),
      },
    },
    openGraph: {
      title: data.seo.title || t("meta.title"),
      description: data.seo.description || t("meta.description"),
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
  const data = await getPricingPage(locale as Locale);

  return <PricingArticle data={data} />;
}