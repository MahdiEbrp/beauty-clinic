import type { Metadata } from "next";
import { getClinicData } from "@/data/clinic";
import HomePage from "@/components/HomePage";
import { getPublicLanding } from "@/lib/landing";
import { siteUrl, localePath, canonicalUrl } from "@/lib/site";
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
    alternates: {
      canonical: canonicalUrl(locale),
      languages: {
        fa: canonicalUrl("fa"),
        en: canonicalUrl("en"),
      },
    },
    openGraph: {
      title: landing.seo.title ?? undefined,
      description: landing.seo.description ?? undefined,
      type: "website",
      url: `${siteUrl}${localePath(locale)}`,
    },
  };
}

export default async function Page() {
  const clinicData = await getClinicData();
  return <HomePage clinicData={clinicData} />;
}
