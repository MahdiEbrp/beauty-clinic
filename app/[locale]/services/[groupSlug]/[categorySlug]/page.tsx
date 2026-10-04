import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/site";
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

  // See the group route for why this must be explicit rather than `{}`.
  if (!data) return { robots: { index: false, follow: false } };

  const path = `/services/${data.group.slug}/${data.category.slug}`;
  const tSite = await getTranslations({ locale, namespace: "site" });
  // Hand-written per-locale SEO copy from `service_categories_i18n`; only the
  // title falls back to a generated pattern, since the category name alone is a
  // weak meta description.
  const title = data.category.seoTitle ?? `${data.category.title} | ${tSite("name")}`;
  const description =
    data.category.seoDescription ??
    data.category.description ??
    data.category.services.find((service) => service.shortDesc)?.shortDesc ??
    `${data.group.title} — ${data.category.title}`;

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