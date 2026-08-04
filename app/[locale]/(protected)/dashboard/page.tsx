import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/site";
import { requireAuth, getActiveSessions } from "@/lib/auth/dal";
import DashboardContent from "@/components/DashboardContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/dashboard`,
      languages: {
        fa: `${siteUrl}/fa/dashboard`,
        en: `${siteUrl}/en/dashboard`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const activeSessions = await getActiveSessions(session.userId);
  return (
    <DashboardContent
      user={session.user}
      sessions={activeSessions}
      currentSessionId={session.sessionId}
    />
  );
}
