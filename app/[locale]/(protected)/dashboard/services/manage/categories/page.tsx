import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CategoriesContent from "@/components/CategoriesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listServiceCategories } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "serviceCategories" });

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

export default async function ManageCategoriesPage() {
  const session = await requirePermission("services.read");
  const initialData = await listServiceCategories({ page: 1, perPage: 10 });

  return <CategoriesContent user={session.user} initialData={initialData} />;
}
