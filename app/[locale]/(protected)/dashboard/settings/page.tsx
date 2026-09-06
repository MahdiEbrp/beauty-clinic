import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SettingsContent } from "@/components/settings-admin";
import { GROUP_IDS, type SettingGroupId } from "@/components/settings-admin/grouping";
import { requirePermission } from "@/lib/auth/dal";
import { listAllSocialLinks } from "@/lib/social/admin";
import { listAllSystemSettings } from "@/lib/settings/admin-all";
import { pageUrl } from "@/lib/site";

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
      canonical: pageUrl(locale, `${ROUTE}`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}`),
        en: pageUrl("en", `${ROUTE}`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const session = await requirePermission("settings.read");
  const groupParam = (await searchParams).group;

  const [initialItems, initialSocialLinks] = await Promise.all([
    listAllSystemSettings(),
    listAllSocialLinks(),
  ]);

  const initialOpenGroups = (GROUP_IDS as readonly string[]).includes(groupParam ?? "")
    ? [groupParam as SettingGroupId]
    : [];

  return (
    <SettingsContent
      user={session.user}
      initialItems={initialItems}
      initialSocialLinks={initialSocialLinks}
      initialOpenGroups={initialOpenGroups}
    />
  );
}