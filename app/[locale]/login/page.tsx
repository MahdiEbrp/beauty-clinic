import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { localizedHref, pageUrl } from "@/lib/site";
import { getSessionCached } from "@/lib/auth/dal";
import OtpLoginForm from "@/components/login/OtpLoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "login" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, "/login"),
      languages: {
        fa: pageUrl("fa", "/login"),
        en: pageUrl("en", "/login"),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const session = await getSessionCached();
  if (session) {
    const locale = await getLocale();
    redirect(localizedHref(locale, "/dashboard"));
  }

  return <OtpLoginForm />;
}
