import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SmsReportsContent } from "@/components/sms-admin/SmsReportsContent";
import { requirePermission } from "@/lib/auth/dal";
import { listSmsMessages } from "@/lib/sms/report-service";
import { listSmsProviders } from "@/lib/sms/provider-service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "smsReports" });
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

export default async function SmsReportsPage() {
  const session = await requirePermission("sms.read");
  const messages = await listSmsMessages({
    page: 1,
    perPage: 20,
    status: "all",
  });
  const providers = await listSmsProviders({
    page: 1,
    perPage: 50,
    status: "all",
  });
  return (
    <SmsReportsContent
      user={session.user}
      initialData={messages}
      providers={providers.items}
    />
  );
}
