import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CreateSocialLinkForm from "@/components/create-social/CreateSocialLinkForm";
import { requirePermission } from "@/lib/auth/dal";
import { getSocialLinkById } from "@/lib/social/admin";
import { siteUrl } from "@/lib/site";

const ROUTE = "/dashboard/settings/social/[id]/edit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "socialWizard" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}${ROUTE.replace("[id]", id)}`,
      languages: {
        fa: `${siteUrl}/fa${ROUTE.replace("[id]", id)}`,
        en: `${siteUrl}/en${ROUTE.replace("[id]", id)}`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function SocialLinksEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await requirePermission("settings.write");
  const link = await getSocialLinkById(id);
  if (!link) notFound();
  return <CreateSocialLinkForm link={link} />;
}