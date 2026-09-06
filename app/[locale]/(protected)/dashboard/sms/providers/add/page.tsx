import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SmsProviderForm } from "@/components/sms-admin/SmsProviderForm";
import { requirePermission } from "@/lib/auth/dal";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/providers/add";

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

export default async function AddSmsProviderPage() {
  const session = await requirePermission("sms.write");
  return (
    <SmsProviderForm
      canSend={session.user.permissions.includes("sms.send")}
    />
  );
}
