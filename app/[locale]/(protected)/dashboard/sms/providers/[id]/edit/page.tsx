import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SmsProviderForm } from "@/components/sms-admin/SmsProviderForm";
import { requirePermission } from "@/lib/auth/dal";
import { getSmsProviderById } from "@/lib/sms/provider-service";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/sms/providers/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "smsProviderForm" });
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

export default async function EditSmsProviderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const session = await requirePermission("sms.write");
  const provider = await getSmsProviderById(id);
  if (!provider) notFound();
  return (
    <SmsProviderForm
      provider={provider}
      canSend={session.user.permissions.includes("sms.send")}
    />
  );
}
