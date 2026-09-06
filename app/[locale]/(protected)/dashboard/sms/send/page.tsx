import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SmsSendContent } from "@/components/sms-admin/SmsSendContent";
import { requirePermission } from "@/lib/auth/dal";
import { getSmsComposeDatasets } from "@/lib/sms/report-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/send";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "smsSend" });
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

export default async function SmsSendPage() {
  await requirePermission("sms.send");
  const datasets = await getSmsComposeDatasets();
  return <SmsSendContent {...datasets} />;
}
