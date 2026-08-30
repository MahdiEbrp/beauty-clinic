import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SmsTemplatesContent } from "@/components/sms-admin/SmsTemplatesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listSmsTemplates } from "@/lib/sms/template-service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/templates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "smsTemplateForm" });
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

export default async function SmsTemplatesPage() {
  const session = await requirePermission("sms.read");
  const initialData = await listSmsTemplates({
    page: 1,
    perPage: 10,
    status: "all",
  });
  return <SmsTemplatesContent user={session.user} initialData={initialData} />;
}
