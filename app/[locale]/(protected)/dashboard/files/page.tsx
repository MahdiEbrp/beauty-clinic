import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import { requirePermission } from "@/lib/auth/dal";
import FilesContent from "@/components/FilesContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "files" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl(locale, "/dashboard/files"),
      languages: {
        fa: pageUrl("fa", "/dashboard/files"),
        en: pageUrl("en", "/dashboard/files"),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function FilesPage() {
  const session = await requirePermission("files.read");

  return <FilesContent user={session.user} />;
}
