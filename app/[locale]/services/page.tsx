import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import ServicesContent from "@/components/ServicesContent";

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

export default function ServicesPage() {
  return <ServicesContent />;
}
