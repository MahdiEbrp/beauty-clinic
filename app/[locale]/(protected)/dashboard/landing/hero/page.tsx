import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import HeroWizard from "@/components/landing-admin/wizard/HeroWizard";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import type { AdminHero } from "@/lib/landing/admin";
import { emptyAdminHero, getLandingHero } from "@/lib/landing/admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingForm" });

  return {
    title: t("metaEdit.title"),
    description: t("metaEdit.description"),
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

export default async function LandingHeroPage() {
  await requirePermission("services.write");
  let hero: AdminHero;
  try {
    const fetched = await getLandingHero();
    // No hero row yet: open the wizard with empty content so the hero heading,
    // tagline, description and CTA buttons can be created from the dashboard.
    hero = fetched ?? emptyAdminHero;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <HeroWizard hero={hero} />;
}