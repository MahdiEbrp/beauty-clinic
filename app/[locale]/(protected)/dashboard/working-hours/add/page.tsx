import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { WorkingHoursForm } from "@/components/working-hours/working-hours-form";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/working-hours";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workingHoursForm" });
  return {
    title: `${t("title.add")} | Nafas Beauty Clinic`,
    alternates: {
      canonical: `${siteUrl}/${locale}${ROUTE}/add`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}/add`,
        en: `${siteUrl}/en${ROUTE}/add`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function AddWorkingHoursPage() {
  await requirePermission("appointments.write");
  return <WorkingHoursForm mode="create" backHref={`${ROUTE}/manage`} />;
}