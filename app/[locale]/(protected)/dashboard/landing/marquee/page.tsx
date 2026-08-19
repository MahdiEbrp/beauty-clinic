import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingCollectionContent } from "@/components/landing-admin/landing-collection";
import { requirePermission } from "@/lib/auth/dal";
import { listCollectionRows } from "@/lib/landing/admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/marquee";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingAdmin" });

  return {
    title: t("collections.marquee.metaTitle"),
    description: t("collections.marquee.metaDescription"),
    alternates: {
      canonical: `${siteUrl}/${locale}${ROUTE}`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}`,
        en: `${siteUrl}/en${ROUTE}`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function LandingMarqueePage() {
  const session = await requirePermission("services.read");
  const initialData = await listCollectionRows("marquee", { page: 1, perPage: 10 });

  return (
    <LandingCollectionContent
      collection="marquee"
      user={session.user}
      initialData={initialData}
    />
  );
}