import { requireAuth } from "@/lib/auth/dal";
import DashboardShell from "@/components/DashboardShell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
