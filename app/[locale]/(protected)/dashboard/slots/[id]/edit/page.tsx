import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { SlotWizard, type SlotEditData } from "@/components/bookings/slot-wizard";
import { requirePermission } from "@/lib/auth/dal";
import { getSlot } from "@/lib/bookings/slots";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/slots";

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
      canonical: pageUrl(locale, `${ROUTE}/${id}/edit`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}/${id}/edit`),
        en: pageUrl("en", `${ROUTE}/${id}/edit`),
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
  if (!z.uuid().safeParse(id).success) notFound();
  const slot = await getSlot(id);
  if (!slot) notFound();
  const editData: SlotEditData = {
    id: slot.id,
    slotDate: String(slot.slotDate).slice(0, 10),
    startTime: String(slot.startTime).slice(0, 5),
    endTime: String(slot.endTime).slice(0, 5),
    capacity: slot.capacity,
    isActive: slot.isActive,
    serviceIds: slot.serviceIds,
  };
  return <SlotWizard mode="edit" slot={editData} backHref={ROUTE} />;
}
