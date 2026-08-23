import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SlotWizard } from "@/components/bookings/slot-wizard";
import { requirePermission } from "@/lib/auth/dal";
import { getSlot } from "@/lib/bookings/slots";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/bookings/manage/slots";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "slotWizard" });
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

export default async function EditSlotPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("appointments.write");
  const { id } = await params;
  const slot = (await getSlot(id)) as unknown as SlotAdminRow;
  if (!slot) notFound();
  return (
    <SlotWizard
      mode="edit"
      slot={{
        id: slot.id,
        slotDate: String(slot.slotDate).slice(0, 10),
        startTime: String(slot.startTime),
        endTime: String(slot.endTime),
        capacity: slot.capacity,
        isActive: slot.isActive,
        bookedCount: 0,
      }}
      backHref={ROUTE}
    />
  );
}
