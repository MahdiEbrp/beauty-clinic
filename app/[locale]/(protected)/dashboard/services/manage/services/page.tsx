import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServiceManagePlaceholder, {
  type ManageEntity,
} from "@/components/ServiceManagePlaceholder";
import { requirePermission } from "@/lib/auth/dal";
import { siteUrl } from "@/lib/site";

const ENTITY: ManageEntity = "services";
const ROUTE = "/dashboard/services/manage/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesManage" });

  return {
    title: t("meta.title", { name: t(`names.${ENTITY}`) }),
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

export default async function ManageServicesPage() {
  await requirePermission("services.read");
  return <ServiceManagePlaceholder entity={ENTITY} />;
}
