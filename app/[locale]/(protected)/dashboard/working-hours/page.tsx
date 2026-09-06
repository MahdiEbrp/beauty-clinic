import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import WorkingHoursHub from "@/components/working-hours/WorkingHoursHub";
import { requirePermission } from "@/lib/auth/dal";
import { getWorkingHoursPerformance } from "@/lib/bookings/working-hours-performance";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/working-hours";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workingHoursHub" });

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

export default async function WorkingHoursPage() {
  await requirePermission("appointments.read");
  const data = await getWorkingHoursPerformance();

  return <WorkingHoursHub data={data} />;
}