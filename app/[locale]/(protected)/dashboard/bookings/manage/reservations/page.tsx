import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ReservationsListView } from "@/components/bookings/reservations-view";
import { requirePermission } from "@/lib/auth/dal";
import { listBookings } from "@/lib/bookings/service";
import { mapReservations } from "@/lib/bookings/admin-types";
import type { ListResult } from "@/components/admin-list/types";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings/manage/reservations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookingReservations" });

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

export default async function ManageReservationsPage() {
  const session = await requirePermission("appointments.read");
  const result = await listBookings({ page: 1, perPage: 10, status: "all" });
  const initialData: ListResult<ReservationAdmin> = {
    items: mapReservations(result.items),
    total: result.total,
    perPage: result.perPage,
    totalPages: result.totalPages,
    page: result.page,
  };
  return <ReservationsListView user={session.user} initialData={initialData} />;
}
