import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import CategoryPage from "@/components/category-page/CategoryPage";
import { getCategoryPage } from "@/lib/services/category-page";
import type { Locale } from "@/lib/services/types";

type CategoryPageRouteParams = {
  locale: string;
  groupSlug: string;
  categorySlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<CategoryPageRouteParams>;
}): Promise<Metadata> {
  const { locale, groupSlug, categorySlug } = await params;
  const data = await getCategoryPage(
    locale as Locale,
    groupSlug,
    categorySlug,
  );

  if (!data) return {};

  const path = `/services/${data.group.slug}/${data.category.slug}`;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const title = `${data.category.title} | ${tSite("name")}`;
  const description =
    data.category.description ?? `${data.group.title} — ${data.category.title}`;

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

export default async function CategoryServicePage({
  params,
}: {
  params: Promise<CategoryPageRouteParams>;
}) {
  const { locale, groupSlug, categorySlug } = await params;
  const data = await getCategoryPage(
    locale as Locale,
    groupSlug,
    categorySlug,
  );

  if (!data) notFound();

  return <CategoryPage data={data} locale={locale} />;
}