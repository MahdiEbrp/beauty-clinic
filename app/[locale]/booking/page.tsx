import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getPublicServiceTree, getRulesForPublic } from "@/lib/services/service";
import { BOOKABLE_ITEMS, bookingLabelFor } from "@/lib/services/bookable";
import { getClinicData } from "@/data/clinic";
import type { Locale } from "@/lib/services/types";
import { buildAlternates } from "@/lib/site";
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
    alternates: buildAlternates(locale, "/booking"),
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
  const localeTyped = locale as Locale;
  const tree = await getPublicServiceTree(localeTyped);
  const clinic = await getClinicData(localeTyped);
  const rules = await getRulesForPublic(localeTyped, { status: "active" });

  // The booking list is a curated, fixed-order subset of the catalog groups.
  const groupsBySlug = new Map(tree.groups.map((group) => [group.slug, group]));
  const bookableGroups = BOOKABLE_ITEMS.flatMap((item) => {
    const group = groupsBySlug.get(item.slug);
    if (!group) return [];
    const label = bookingLabelFor(item.slug, localeTyped);
    return [label ? { ...group, title: label } : group];
  });

  const bookableTree = {
    ...tree,
    groups: bookableGroups,
  };

  return (
    <BookingWizard
      tree={bookableTree}
      rules={rules}
      currency={clinic.currency}
      openingHours={clinic.openingHours}
      minCancelHours={clinic.minCancelHours}
      defaultDeposit={clinic.defaultDeposit}
      clinic={{
        clinicName: clinic.content.clinicName,
        addressTitle: clinic.content.addressTitle,
        address: clinic.address.streetAddress,
        telephone: clinic.telephone,
        phoneDisplay: clinic.telephone ?? "",
        neshanMap: clinic.maps.neshan,
        googleMap: clinic.maps.google,
      }}
    />
  );
}
