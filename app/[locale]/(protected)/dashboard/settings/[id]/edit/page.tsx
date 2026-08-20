import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateSettingForm from "@/components/create-setting/CreateSettingForm";
import { requirePermission } from "@/lib/auth/dal";
import { getSystemSettingById } from "@/lib/settings/admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/settings/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "settingWizard" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}${ROUTE.replace("[id]", id)}`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE.replace("[id]", id)}`,
        en: `${siteUrl}/en${ROUTE.replace("[id]", id)}`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function SettingsEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await requirePermission("settings.write");
  const setting = await getSystemSettingById(id);
  if (!setting) notFound();
  return <CreateSettingForm setting={setting} />;
}