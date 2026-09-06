import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import LandingItemForm from "@/components/landing-admin/LandingItemForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getCollectionRow } from "@/lib/landing/admin";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/landing/stats";

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
      canonical: pageUrl(locale, `${ROUTE}/edit`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}/edit`),
        en: pageUrl("en", `${ROUTE}/edit`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditLandingstatsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("services.write");
  const { id } = await params;
  let row;
  try {
    row = await getCollectionRow("stats", id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <LandingItemForm collection="stats" initial={row} />;
}
