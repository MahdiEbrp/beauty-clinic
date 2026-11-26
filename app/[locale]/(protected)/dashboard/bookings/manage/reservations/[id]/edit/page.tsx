import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ReservationWizard } from "@/components/bookings/reservation-wizard";
import { requirePermission } from "@/lib/auth/dal";
import { getBookingGroupById } from "@/lib/bookings/service";
import { getClinicData } from "@/data/clinic";
import type { Locale } from "@/lib/services/types";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings/manage/reservations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "reservationWizard" });
  return {
    title: `${t("title.edit")} | Nafas Beauty Clinic`,
    alternates: {
      canonical: pageUrl(locale, `${ROUTE}/${id}/edit`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}/${id}/edit`),
        en: pageUrl("en", `${ROUTE}/${id}/edit`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditReservationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("appointments.write");
  const { locale, id } = await params;
  const clinic = await getClinicData(locale as Locale);
  let reservation = null;
  try {
    reservation = await getBookingGroupById(id);
  } catch {
    notFound();
  }
  return (
    <ReservationWizard
      mode="edit"
      reservation={reservation}
      backHref={ROUTE}
      currency={clinic.currency}
    />
  );
}
