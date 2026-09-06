import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmailProvidersContent } from "@/components/email-admin/EmailProvidersContent";
import { requirePermission } from "@/lib/auth/dal";
import { listEmailProviders } from "@/lib/email/provider-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/email/providers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailProviderForm" });
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

export default async function EmailProvidersPage() {
  const session = await requirePermission("email.read");
  const initialData = await listEmailProviders({
    page: 1,
    perPage: 10,
    status: "all",
  });
  return <EmailProvidersContent user={session.user} initialData={initialData} />;
}