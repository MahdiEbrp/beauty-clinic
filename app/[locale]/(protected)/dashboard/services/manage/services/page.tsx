import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServicesContent from "@/ServicesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listServices } from "@/lib/services/service";
import { getClinicData } from "@/data/clinic";
import type { Locale } from "@/lib/services/types";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "serviceServices" });

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

export default async function ManageServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await requirePermission("services.read");
  const { locale } = await params;
  const initialData = await listServices({ page: 1, perPage: 10 });
  const clinic = await getClinicData(locale as Locale);
  return <ServicesContent user={session.user} initialData={initialData} currency={clinic.currency} />;
}