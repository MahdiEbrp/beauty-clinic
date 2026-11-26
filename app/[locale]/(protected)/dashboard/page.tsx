import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import { requireAuth, getActiveSessions } from "@/lib/auth/dal";
import { hasPermission } from "@/lib/auth/rbac";
import { listRecentBookings } from "@/lib/bookings/service";
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
      canonical: pageUrl(locale, "/dashboard"),
      languages: {
        fa: pageUrl("fa", "/dashboard"),
        en: pageUrl("en", "/dashboard"),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const activeSessions = await getActiveSessions(session.userId);

  const canReadAppointments = hasPermission(
    session.user.permissions,
    "appointments.read",
  );
  const recentBookings = canReadAppointments
    ? await listRecentBookings(10)
    : [];

  return (
    <DashboardContent
      user={session.user}
      sessions={activeSessions}
      currentSessionId={session.sessionId}
      recentReservations={recentBookings}
    />
  );
}
