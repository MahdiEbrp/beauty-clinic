import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CreateRulesForm from "@/components/rules/CreateRulesForm";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/rules/add";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardRules" });

  return {
    title: t("addRule.title"),
    description: t("addRule.subtitle"),
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

export default async function AddRulePage() {
  await requirePermission("rules.write");
  return <CreateRulesForm />;
}
