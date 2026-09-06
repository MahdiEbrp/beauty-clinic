import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingCollectionContent } from "@/components/landing-admin/landing-collection";
import { requirePermission } from "@/lib/auth/dal";
import { listCollectionRows } from "@/lib/landing/admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingAdmin" });

  return {
    title: t("collections.services.metaTitle"),
    description: t("collections.services.metaDescription"),
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

export default async function LandingservicesPage() {
  const session = await requirePermission("services.read");
  const initialData = await listCollectionRows("services", { page: 1, perPage: 10 });

  return (
    <LandingCollectionContent
      collection="services"
      user={session.user}
      initialData={initialData}
    />
  );
}
