import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { EmailProviderForm } from "@/components/email-admin/EmailProviderForm";
import { requirePermission } from "@/lib/auth/dal";
import { getEmailProviderById } from "@/lib/email/provider-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/email/providers/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "emailProviderForm" });
  const route = ROUTE.replace("[id]", id);
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, `${route}`),
      languages: {
        fa: pageUrl("fa", `${route}`),
        en: pageUrl("en", `${route}`),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditEmailProviderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await requirePermission("email.write");
  const provider = await getEmailProviderById(id);
  if (!provider) notFound();
  return <EmailProviderForm provider={provider} />;
}