import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SlotsListView } from "@/components/bookings/slots-view";
import { requirePermission } from "@/lib/auth/dal";
import { listSlotsAdmin } from "@/lib/bookings/slots-admin";
import type { ListResult } from "@/components/admin-list/types";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings/manage/slots";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookingSlots" });

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

export default async function ManageSlotsPage() {
  const session = await requirePermission("appointments.read");
  const result = await listSlotsAdmin({ page: 1, perPage: 10 });
  const initialData: ListResult<SlotAdminRow> = {
    items: result.items,
    total: result.total,
    perPage: result.perPage,
    totalPages: result.totalPages,
    page: result.page,
  };
  return <SlotsListView user={session.user} initialData={initialData} />;
}
