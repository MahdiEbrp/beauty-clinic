import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BookingsHub from "@/components/bookings-admin/BookingsHub";
import { requirePermission } from "@/lib/auth/dal";
import { getBookingsPerformance } from "@/lib/bookings/performance";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookingAdmin" });

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

export default async function BookingsPage() {
  await requirePermission("appointments.read");
  const data = await getBookingsPerformance();
  return <BookingsHub data={data} />;
}
