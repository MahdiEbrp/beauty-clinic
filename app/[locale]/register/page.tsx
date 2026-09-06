import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { localizedHref, pageUrl } from "@/lib/site";
import { getSessionCached } from "@/lib/auth/dal";
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
      canonical: pageUrl(locale, "/register"),
      languages: {
        fa: pageUrl("fa", "/register"),
        en: pageUrl("en", "/register"),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage() {
  const session = await getSessionCached();
  if (session) {
    const locale = await getLocale();
    redirect(localizedHref(locale, "/dashboard"));
  }

  return <RegisterForm />;
}
