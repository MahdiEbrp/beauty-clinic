import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/site";
import { requirePermission } from "@/lib/auth/dal";
import { listUsers } from "@/lib/users/service";
import UsersContent from "@/components/UsersContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "users" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/dashboard/users`,
      languages: {
        fa: `${siteUrl}/fa/dashboard/users`,
        en: `${siteUrl}/en/dashboard/users`,
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function UsersPage() {
  const session = await requirePermission("users.read");
  const initialData = await listUsers({ page: 1, perPage: 10 });

  return <UsersContent user={session.user} initialData={initialData} />;
}
