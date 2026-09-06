import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmailHub } from "@/components/email-admin/EmailHub";
import { requirePermission } from "@/lib/auth/dal";
import { getEmailOverview } from "@/lib/email/report-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/email";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailAdmin" });
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

export default async function EmailDashboardPage() {
  const session = await requirePermission("email.read");
  const overview = await getEmailOverview();
  return <EmailHub user={session.user} overview={overview} />;
}