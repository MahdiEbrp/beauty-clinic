import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { buildAlternates, localizedHref } from "@/lib/site";
import ForcedPasswordForm from "@/components/ForcedPasswordForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resetPassword" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
    alternates: buildAlternates(locale, "/reset-password"),
  };
}

export default async function ResetPasswordPage() {
  const session = await requireAuth();
  const locale = await getLocale();
  if (!session.user.mustChangePassword) redirect(localizedHref(locale, "/dashboard"));
  return <ForcedPasswordForm fullName={session.user.fullName} />;
}
