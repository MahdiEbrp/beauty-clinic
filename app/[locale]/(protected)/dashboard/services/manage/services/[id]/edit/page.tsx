import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateServiceServiceForm from "@/components/create-service/CreateServiceServiceForm";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/dal";
import { getService, listServiceCategoryOptions } from "@/lib/services/service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/services/manage/services/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const service = await getService(id);
  const t = await getTranslations({ locale, namespace: "serviceWizard" });

  return {
    title: t("meta.title", { name: service.title }),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, `${ROUTE.replace("[id]", id)}`),
      languages: {
        fa: pageUrl("fa", `${ROUTE.replace("[id]", id)}`),
        en: pageUrl("en", `${ROUTE.replace("[id]", id)}`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function ManageServicesEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await requirePermission("services.write");
  let service;
  try {
    service = await getService(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const categoryOptions = await listServiceCategoryOptions();

  return <CreateServiceServiceForm service={service} categoryOptions={categoryOptions} />;
}
