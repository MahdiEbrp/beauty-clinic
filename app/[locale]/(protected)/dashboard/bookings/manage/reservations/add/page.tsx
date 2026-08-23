import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ReservationWizard } from "@/components/bookings/reservation-wizard";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings/manage/reservations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservationWizard" });
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

export default async function AddReservationPage() {
  await requirePermission("appointments.write");
  return <ReservationWizard mode="create" backHref={ROUTE} />;
}
