import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { EmailTemplateForm } from "@/components/email-admin/EmailTemplateForm";
import { requirePermission } from "@/lib/auth/dal";
import { getEmailTemplateById } from "@/lib/email/template-service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/email/templates/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "emailTemplateForm" });
  const route = ROUTE.replace("[id]", id);
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}${route}`,
      languages: {
        fa: `${siteUrl}/fa${route}`,
        en: `${siteUrl}/en${route}`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function EditEmailTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await requirePermission("email.write");
  const template = await getEmailTemplateById(id);
  if (!template) notFound();
  return <EmailTemplateForm template={template} />;
}