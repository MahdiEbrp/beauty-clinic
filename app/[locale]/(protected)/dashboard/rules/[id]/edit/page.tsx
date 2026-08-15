import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateRulesForm from "@/components/rules/CreateRulesForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getRule } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/rules";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardRules" });
  const canonical = `${siteUrl}/${locale}${ROUTE}/${id}/edit`;

  return {
    title: t("editRule.title"),
    description: t("editRule.subtitle"),
    alternates: {
      canonical,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}/${id}/edit`,
        en: `${siteUrl}/en${ROUTE}/${id}/edit`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditRulePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("rules.write");
  const { id } = await params;
  let rule;
  try {
    rule = await getRule(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <CreateRulesForm rule={rule} />;
}
