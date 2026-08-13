import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CreateServiceCategoryForm from "@/components/create-category/CreateServiceCategoryForm";
import { requirePermission } from "@/lib/auth/dal";
import { listGroupOptions } from "@/lib/services/service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/categories/add";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoryWizard" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
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

export default async function AddServiceCategoryPage() {
  await requirePermission("services.write");
  const groupOptions = await listGroupOptions();

  return <CreateServiceCategoryForm groupOptions={groupOptions} />;
}
