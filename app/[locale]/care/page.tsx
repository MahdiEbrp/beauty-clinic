import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/site";
import CareContent from "@/components/CareContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "care" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/care`,
      languages: {
        fa: `${siteUrl}/fa/care`,
        en: `${siteUrl}/en/care`,
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

interface CarePageProps {
  params: Promise<{ locale: string }>;
}

export default async function CarePage({ params }: CarePageProps) {
  const { locale } = await params;
  return <CareContent locale={locale} />;
}
