import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireAuth } from "@/lib/auth/dal";
import { listMyBookings, loadBookingOwner } from "@/lib/bookings/mine";
import type { ListResult } from "@/components/admin-list/types";
import type { MyReservationAdmin } from "@/lib/bookings/admin-types";
import { MyReservationsListView } from "@/components/bookings/my-reservations-view";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/my-reservations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "myReservations" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, ROUTE),
      languages: {
        fa: pageUrl("fa", ROUTE),
        en: pageUrl("en", ROUTE),
      },
    },
    robots: { index: false, follow: false },
  };
}

/**
 * The customer panel: any signed-in user sees their own reservations here and
 * can cancel an order until the clinic's cancellation window closes.
 */
export default async function MyReservationsPage() {
  const session = await requireAuth();
  const owner = await loadBookingOwner(session.user.id);
  const result = await listMyBookings(owner, {
    page: 1,
    perPage: 10,
    status: "all",
  });
  const initialData: ListResult<MyReservationAdmin> = {
    items: result.items,
    total: result.total,
    perPage: result.perPage,
    totalPages: result.totalPages,
    page: result.page,
  };
  return <MyReservationsListView user={session.user} initialData={initialData} />;
}
