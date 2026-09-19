import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { WorkingHoursListView } from "@/components/working-hours/working-hours-view";
import { requirePermission } from "@/lib/auth/dal";
import { listWorkingHoursAdmin } from "@/lib/bookings/working-hours-admin";
import type { ListResult } from "@/components/admin-list/types";
import type { WorkingHoursListRow } from "@/lib/bookings/working-hours-admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/working-hours/manage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workingHours" });

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

export default async function ManageWorkingHoursPage() {
  const session = await requirePermission("appointments.read");
  const result = await listWorkingHoursAdmin({ page: 1, perPage: 10 });
  const initialData: ListResult<WorkingHoursListRow> = {
    items: result.items,
    total: result.total,
    perPage: result.perPage,
    totalPages: result.totalPages,
    page: result.page,
  };
  return (
    <WorkingHoursListView user={session.user} initialData={initialData} />
  );
}