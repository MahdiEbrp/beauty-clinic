import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import GroupPage from "@/components/group-page/GroupPage";
import { getGroupPage } from "@/lib/services/group-page";
import type { Locale } from "@/lib/services/types";

type GroupPageRouteParams = {
  locale: string;
  groupSlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<GroupPageRouteParams>;
}): Promise<Metadata> {
  const { locale, groupSlug } = await params;
  const data = await getGroupPage(locale as Locale, groupSlug);

  if (!data) return {};

  const path = `/services/${data.group.slug}`;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const title = `${data.group.title} | ${tSite("name")}`;
  const description =
    data.group.description ??
    `${data.group.title} — ${data.categories.length} ${data.categories.length === 1 ? "category" : "categories"}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl(locale, path),
      languages: {
        fa: pageUrl("fa", path),
        en: pageUrl("en", path),
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "fa" ? "fa_IR" : "en_US",
    },
    robots: { index: true, follow: true },
  };
}

export default async function GroupServicePage({
  params,
}: {
  params: Promise<GroupPageRouteParams>;
}) {
  const { locale, groupSlug } = await params;
  const data = await getGroupPage(locale as Locale, groupSlug);

  if (!data) notFound();

  return <GroupPage data={data} locale={locale} />;
}