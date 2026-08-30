import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SmsHub } from "@/components/sms-admin/SmsHub";
import { requirePermission } from "@/lib/auth/dal";
import { getSmsOverview } from "@/lib/sms/report-service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "smsAdmin" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
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

export default async function SmsDashboardPage() {
  const session = await requirePermission("sms.read");
  const overview = await getSmsOverview();
  return <SmsHub user={session.user} overview={overview} />;
}
