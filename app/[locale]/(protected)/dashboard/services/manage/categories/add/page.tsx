import type { Metadata } from "next";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

import CreateServiceCategoryForm from "@/components/create-category/CreateServiceCategoryForm";
import { requirePermission } from "@/lib/auth/dal";
import { listGroupOptions } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

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
      canonical: pageUrl(locale, `${ROUTE}`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}`),
        en: pageUrl("en", `${ROUTE}`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function AddServiceCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string | string[] }>;
}) {
  await requirePermission("services.write");
  const [groupOptions, query] = await Promise.all([listGroupOptions(), searchParams]);
  const rawGroupId = typeof query.groupId === "string" ? query.groupId : undefined;
  const parsed = z.uuid().safeParse(rawGroupId);
  const initialGroupId = parsed.success && groupOptions.some((option) => option.id === parsed.data)
    ? parsed.data
    : undefined;

  return <CreateServiceCategoryForm groupOptions={groupOptions} initialGroupId={initialGroupId} />;
}
