import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SocialLinksContent } from "@/components/social-admin";
import { requirePermission } from "@/lib/auth/dal";
import { listSocialLinks } from "@/lib/social/admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/settings/social";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "socialAdmin" });

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

export default async function SocialLinksPage() {
  const session = await requirePermission("settings.read");
  const initialData = await listSocialLinks({ page: 1, perPage: 10 });
  return <SocialLinksContent user={session.user} initialData={initialData} />;
}