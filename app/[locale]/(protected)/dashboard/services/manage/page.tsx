import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { UnifiedServiceManager } from "@/components/services/UnifiedServiceManager";
import { requirePermission } from "@/lib/auth/dal";
import { listServiceGroups } from "@/lib/services/service";
import type { ListServiceGroupsResult } from "@/lib/services/types";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "serviceGroups" });

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

export default async function ManageServicesPage() {
  const session = await requirePermission("services.read");
  const initialData: ListServiceGroupsResult = await listServiceGroups({
    page: 1,
    perPage: 100,
    status: "all",
  });

  return (
    <UnifiedServiceManager
      user={session.user}
      initialGroups={initialData.items}
    />
  );
}
