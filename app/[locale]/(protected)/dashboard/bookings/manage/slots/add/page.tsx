import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SlotWizard } from "@/components/bookings/slot-wizard";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings/manage/slots";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "slotWizard" });
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

export default async function AddSlotPage() {
  await requirePermission("appointments.write");
  return <SlotWizard mode="create" backHref={`${ROUTE}`} />;
}
