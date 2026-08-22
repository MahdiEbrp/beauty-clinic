import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getPublicServiceTree } from "@/lib/services/service";
import { getClinicData } from "@/data/clinic";
import type { Locale } from "@/lib/services/types";
import { siteUrl } from "@/lib/site";
import BookingWizard from "@/components/booking/BookingWizard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/booking`,
      languages: {
        fa: `${siteUrl}/fa/booking`,
        en: `${siteUrl}/en/booking`,
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tree = await getPublicServiceTree(locale as Locale);
  const clinic = await getClinicData(locale as Locale);

  return (
    <BookingWizard
      tree={tree}
      currency={clinic.currency}
      openingHours={clinic.openingHours}
    />
  );
}
