import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmailReportsContent } from "@/components/email-admin/EmailReportsContent";
import { requirePermission } from "@/lib/auth/dal";
import { listEmailMessages } from "@/lib/email/report-service";
import { listEmailProviders } from "@/lib/email/provider-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/email/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailReports" });
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

export default async function EmailReportsPage() {
  const session = await requirePermission("email.read");
  const messages = await listEmailMessages({
    page: 1,
    perPage: 20,
    status: "all",
  });
  const providers = await listEmailProviders({
    page: 1,
    perPage: 50,
    status: "all",
  });
  return (
    <EmailReportsContent
      user={session.user}
      initialData={messages}
      providers={providers.items}
    />
  );
}