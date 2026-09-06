import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateRuleForm from "@/components/create-rule/CreateRuleForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getRule } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/rules";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "rulesWizard" });
  const canonical = pageUrl(locale, `${ROUTE}/${id}/edit`);

  return {
    title: t("metaEdit.title"),
    description: t("metaEdit.description"),
    alternates: {
      canonical,
      languages: {
        fa: pageUrl("fa", `${ROUTE}/${id}/edit`),
        en: pageUrl("en", `${ROUTE}/${id}/edit`),
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

  return <CreateRuleForm rule={rule} />;
}
