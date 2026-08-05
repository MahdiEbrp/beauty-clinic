import { requireAuth } from "@/lib/auth/dal";
import DashboardShell from "@/components/DashboardShell";
import { getLocale } from "next-intl/server";
import { localizedHref } from "@/lib/site";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const locale = await getLocale();
  if (session.user.mustChangePassword) redirect(localizedHref(locale, "/reset-password"));
  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
