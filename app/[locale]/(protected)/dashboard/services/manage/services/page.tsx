import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServicesContent from "@/ServicesContent";
import { requirePermission } from "@/lib/auth/dal";
import { listServiceCategoryOptions, listServices } from "@/lib/services/service";
import { getClinicData } from "@/data/clinic";
import type { Locale } from "@/lib/services/types";
import { pageUrl } from "@/lib/site";
import { listServicesQuerySchema } from "@/lib/validation/services";

const ROUTE = "/dashboard/services/manage/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "serviceServices" });

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

export default async function ManageServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categoryId?: string | string[] }>;
}) {
  const session = await requirePermission("services.read");
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const rawCategoryId = typeof query.categoryId === "string" ? query.categoryId : undefined;
  const parsed = listServicesQuerySchema.safeParse({ categoryId: rawCategoryId });
  const categoryId = parsed.success ? parsed.data.categoryId : undefined;
  const [initialData, clinic, categoryOptions] = await Promise.all([
    listServices({ page: 1, perPage: 10, categoryId }),
    getClinicData(locale as Locale),
    listServiceCategoryOptions(),
  ]);
  const categoryName = categoryOptions.find((option) => option.id === categoryId)?.name;
  return (
    <ServicesContent
      user={session.user}
      initialData={initialData}
      currency={clinic.currency}
      categoryId={categoryId}
      categoryName={categoryName}
    />
  );
}