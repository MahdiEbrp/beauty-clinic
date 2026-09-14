import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import {
  WorkingHoursForm,
  type WorkingHoursEditData,
} from "@/components/working-hours/working-hours-form";
import { requirePermission } from "@/lib/auth/dal";
import { getWorkingHour } from "@/lib/bookings/working-hours-admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/working-hours";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "workingHoursForm" });
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

export default async function EditWorkingHoursPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("appointments.write");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const record = await getWorkingHour(id);
  if (!record) notFound();
  const editData: WorkingHoursEditData = {
    id: record.id,
    day: record.day,
    opens: record.opens,
    closes: record.closes,
    capacity: record.capacity,
    displayOrder: record.displayOrder,
    isActive: record.isActive,
    patterns: record.patterns.map((pattern) => ({
      startTime: pattern.startTime,
      capacity: pattern.capacity,
      groupIds: pattern.groupIds ?? [],
    })),
  };
  return (
    <WorkingHoursForm mode="edit" record={editData} backHref={`${ROUTE}/manage`} />
  );
}