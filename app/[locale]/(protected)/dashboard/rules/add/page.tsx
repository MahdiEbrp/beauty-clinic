import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CreateRuleForm from "@/components/create-rule/CreateRuleForm";
import { requirePermission } from "@/lib/auth/dal";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/rules/add";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rulesWizard" });

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

export default async function AddRulePage() {
  await requirePermission("rules.write");
  return <CreateRuleForm />;
}
