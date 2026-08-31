import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SmsTemplateForm } from "@/components/sms-admin/SmsTemplateForm";
import { requirePermission } from "@/lib/auth/dal";
import { getSmsTemplateById } from "@/lib/sms/template-service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/templates/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "smsTemplateForm" });
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

export default async function EditSmsTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const session = await requirePermission("sms.write");
  const template = await getSmsTemplateById(id);
  if (!template) notFound();
  return (
    <SmsTemplateForm
      template={template}
      canSend={session.user.permissions.includes("sms.send")}
    />
  );
}
