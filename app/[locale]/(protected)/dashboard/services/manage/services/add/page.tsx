import type { Metadata } from "next";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

import CreateServiceServiceForm from "@/components/create-service/CreateServiceServiceForm";
import { requirePermission } from "@/lib/auth/dal";
import { pageUrl } from "@/lib/site";
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
      canonical: pageUrl(locale, `${ROUTE}`),
      languages: {
        fa: pageUrl("fa", `${ROUTE}`),
        en: pageUrl("en", `${ROUTE}`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function ManageServicesAddPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string | string[] }>;
}) {
  await requirePermission("services.write");
  const [categoryOptions, query] = await Promise.all([listServiceCategoryOptions(), searchParams]);
  const rawCategoryId = typeof query.categoryId === "string" ? query.categoryId : undefined;
  const parsed = z.uuid().safeParse(rawCategoryId);
  const initialCategoryId = parsed.success && categoryOptions.some((option) => option.id === parsed.data)
    ? parsed.data
    : undefined;

  return <CreateServiceServiceForm categoryOptions={categoryOptions} initialCategoryId={initialCategoryId} />;
}
