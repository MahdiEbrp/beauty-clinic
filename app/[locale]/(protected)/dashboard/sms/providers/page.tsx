import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SmsProvidersContent } from "@/components/sms-admin/SmsProvidersContent";
import { requirePermission } from "@/lib/auth/dal";
import { listSmsProviders } from "@/lib/sms/provider-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/providers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "smsProviderForm" });
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

export default async function SmsProvidersPage() {
  const session = await requirePermission("sms.read");
  const initialData = await listSmsProviders({
    page: 1,
    perPage: 10,
    status: "all",
  });
  return <SmsProvidersContent user={session.user} initialData={initialData} />;
}
