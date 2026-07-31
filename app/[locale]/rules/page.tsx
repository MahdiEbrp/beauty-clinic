import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/site";
import RulesContent from "@/components/RulesContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rules" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/rules`,
      languages: {
        fa: `${siteUrl}/fa/rules`,
        en: `${siteUrl}/en/rules`,
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

export default function RulesPage() {
  return <RulesContent />;
}
