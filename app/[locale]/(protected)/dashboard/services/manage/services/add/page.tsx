import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CreateServiceServiceForm from "@/components/create-service/CreateServiceServiceForm";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";
import { listServiceCategoryOptions } from "@/lib/services/service";

const ROUTE = "/dashboard/services/manage/services/add";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "serviceWizard" });

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

export default async function ManageServicesAddPage() {
  await requirePermission("services.write");
  const categoryOptions = await listServiceCategoryOptions();

  return <CreateServiceServiceForm categoryOptions={categoryOptions} />;
}
