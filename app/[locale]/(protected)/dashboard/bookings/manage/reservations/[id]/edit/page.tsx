import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ReservationWizard } from "@/components/bookings/reservation-wizard";
import { requirePermission } from "@/lib/auth/dal";
import { getBooking } from "@/lib/bookings/service";
import { toReservationAdmin } from "@/lib/bookings/admin-types";
import { siteUrl } from "@/lib/site";

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
      canonical: `${siteUrl}/${locale}${ROUTE}/${id}/edit`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}/${id}/edit`,
        en: `${siteUrl}/en${ROUTE}/${id}/edit`,
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
  const { id } = await params;
  let reservation = null;
  try {
    reservation = toReservationAdmin(await getBooking(id));
  } catch {
    notFound();
  }
  return <ReservationWizard mode="edit" reservation={reservation} backHref={ROUTE} />;
}
