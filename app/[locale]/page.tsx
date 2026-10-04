import type { Metadata } from "next";
import { getClinicData } from "@/data/clinic";
import HomePage from "@/components/HomePage";
import { getPublicLanding } from "@/lib/landing";
import { pageUrl, buildAlternates } from "@/lib/site";
import type { Locale } from "@/lib/services/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const landing = await getPublicLanding(locale as Locale);

  return {
    title: landing.seo.title ?? undefined,
    description: landing.seo.description ?? undefined,
    alternates: buildAlternates(locale, "/"),
    openGraph: {
      title: landing.seo.title ?? undefined,
      description: landing.seo.description ?? undefined,
      type: "website",
      url: pageUrl(locale, "/"),
    },
    other: {
      enamad: "9876985",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const localeTyped = locale as Locale;
  const landing = await getPublicLanding(localeTyped);
  const clinicData = await getClinicData(localeTyped);
  return <HomePage clinicData={clinicData} landing={landing} />;
}
