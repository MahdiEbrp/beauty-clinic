import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SettingsContent } from "@/components/settings-admin";
import { requirePermission } from "@/lib/auth/dal";
import { listSystemSettings } from "@/lib/settings/admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settingsAdmin" });

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

export default async function SettingsPage() {
  const session = await requirePermission("settings.read");
  const initialData = await listSystemSettings({ page: 1, perPage: 10 });
  return <SettingsContent user={session.user} initialData={initialData} />;
}