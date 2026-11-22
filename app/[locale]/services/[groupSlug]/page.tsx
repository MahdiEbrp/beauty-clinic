import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/site";
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

  // Resolved before the page calls notFound(), so on an unknown slug we must
  // explicitly refuse indexing rather than return {} and let this fall back to
  // the locale layout's metadata (which would advertise the homepage's title
  // and canonical for a junk URL).
  if (!data) return { robots: { index: false, follow: false } };

  const path = `/services/${data.group.slug}`;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tGroup = await getTranslations({ locale, namespace: "servicesPage" });
  // The catalog ships a hand-written, per-locale SEO title and description for
  // every group; only fall back to the generic pattern when they are absent.
  const title = data.group.seoTitle ?? `${data.group.title} | ${tSite("name")}`;
  const description =
    data.group.seoDescription ??
    data.group.description ??
    (data.hasSubcategories
      ? tGroup("meta.categoryFallbackDescription", {
          group: data.group.title,
          count: data.categories.length,
        })
      : tGroup("meta.groupFallbackDescription", {
          group: data.group.title,
          count: data.detailServices.length,
        }));

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
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