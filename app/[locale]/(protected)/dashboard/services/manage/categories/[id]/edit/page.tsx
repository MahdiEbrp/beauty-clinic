import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateServiceCategoryForm from "@/components/create-category/CreateServiceCategoryForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getCategory, listGroupOptions } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoryWizard" });

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

export default async function EditServiceCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await requirePermission("services.write");
  const { id } = await params;
  let category;
  try {
    category = await getCategory(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const groupOptions = await listGroupOptions();

  return <CreateServiceCategoryForm category={category} groupOptions={groupOptions} />;
}
