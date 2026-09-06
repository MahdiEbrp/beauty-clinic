import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import GroupsContent from "@/components/GroupsContent";
import { requirePermission } from "@/lib/auth/dal";
import { listServiceGroups } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/groups";

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

export default async function ManageGroupsPage() {
  const session = await requirePermission("services.read");
  const initialData = await listServiceGroups({ page: 1, perPage: 10 });

  return <GroupsContent user={session.user} initialData={initialData} />;
}
