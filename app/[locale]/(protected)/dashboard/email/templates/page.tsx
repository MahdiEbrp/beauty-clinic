import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmailTemplatesContent } from "@/components/email-admin/EmailTemplatesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listEmailTemplates } from "@/lib/email/template-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/email/templates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailTemplateForm" });
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

export default async function EmailTemplatesPage() {
  const session = await requirePermission("email.read");
  const initialData = await listEmailTemplates({
    page: 1,
    perPage: 10,
    status: "all",
  });
  return <EmailTemplatesContent user={session.user} initialData={initialData} />;
}