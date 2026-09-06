import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RulesContent } from "@/components/rules";
import { requirePermission } from "@/lib/auth/dal";
import { listRulesAdmin } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/rules";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardRules" });

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

export default async function ManageRulesPage() {
  const session = await requirePermission("rules.read");
  const initialData = await listRulesAdmin({
    page: 1,
    perPage: 10,
    status: "all",
  });

  return <RulesContent user={session.user} initialData={initialData} />;
}
