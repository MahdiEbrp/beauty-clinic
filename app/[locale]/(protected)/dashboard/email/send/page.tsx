import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmailSendContent } from "@/components/email-admin/EmailSendContent";
import { requirePermission } from "@/lib/auth/dal";
import { getEmailComposeDatasets } from "@/lib/email/report-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/email/send";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailSend" });
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

export default async function EmailSendPage() {
  await requirePermission("email.send");
  const datasets = await getEmailComposeDatasets();
  return <EmailSendContent {...datasets} />;
}