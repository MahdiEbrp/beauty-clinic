import { requireAuth } from "@/lib/auth/dal";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <main className="flex-1">{children}</main>;
}
