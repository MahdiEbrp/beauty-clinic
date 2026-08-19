import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import LandingItemForm from "@/components/landing-admin/LandingItemForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getCollectionRow } from "@/lib/landing/admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/gallery";

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
      canonical: `${siteUrl}/${locale}${ROUTE}/edit`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE}/edit`,
        en: `${siteUrl}/en${ROUTE}/edit`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditLandinggalleryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("services.write");
  const { id } = await params;
  let row;
  try {
    row = await getCollectionRow("gallery", id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <LandingItemForm collection="gallery" initial={row} />;
}
