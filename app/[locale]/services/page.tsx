import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import type { Locale } from "@/lib/services/types";
import { getServicesIndex } from "@/lib/services/services-index";
import ServicesIndex from "@/components/services-index/ServicesIndex";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, "/services"),
      languages: {
        fa: pageUrl("fa", "/services"),
        en: pageUrl("en", "/services"),
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getServicesIndex(locale as Locale);
  return <ServicesIndex data={data} locale={locale} />;
}
