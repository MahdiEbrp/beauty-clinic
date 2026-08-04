import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { siteUrl, localizedHref } from "@/lib/site";
import { getSession } from "@/lib/auth/dal";
import RegisterForm from "@/components/RegisterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "register" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/register`,
      languages: {
        fa: `${siteUrl}/fa/register`,
        en: `${siteUrl}/en/register`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    const locale = await getLocale();
    redirect(localizedHref(locale, "/dashboard"));
  }

  return <RegisterForm />;
}
