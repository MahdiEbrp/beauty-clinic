import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import CategoryHeader from "./CategoryHeader";
import CategoryJsonLd from "./CategoryJsonLd";
import CategoryFaq, { type CategoryFaqItem } from "./CategoryFaq";
import CategoryGallery from "./CategoryGallery";
import CategoryDetails from "./CategoryDetails";
import type { CategoryPageData } from "@/lib/services/category-page";

type CategoryPageProps = {
  data: CategoryPageData;
  locale: string;
};

function toCrumbs(
  data: CategoryPageData,
  locale: string,
  tHome: string,
  tServices: string,
): BreadcrumbItem[] {
  const path = `/services/${data.group.slug}/${data.category.slug}`;
  return [
    { label: tHome, href: "/" },
    { label: tServices, href: "/services" },
    { label: data.group.title, href: `/services/${data.group.slug}` },
    { label: data.category.title, href: path },
  ];
}

function toAbsoluteCrumbs(
  crumbs: BreadcrumbItem[],
  locale: string,
): BreadcrumbItem[] {
  return crumbs.map((crumb) => ({
    label: crumb.label,
    href: pageUrl(locale, crumb.href === "/" ? "/" : crumb.href),
  }));
}

type BreadcrumbItem = {
  label: string;
  href: string;
};

/**
 * A single service-category page stripped down to what the visitor actually
 * needs for a treatment page: the category description and a photo gallery.
 * Price, brand and reservation/booking UI are intentionally not rendered here.
 */
export default async function CategoryPage({
  data,
  locale,
}: CategoryPageProps) {
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const crumbs = toCrumbs(data, locale, t("breadcrumb.home"), t("breadcrumb.services"));
  const absoluteCrumbs = toAbsoluteCrumbs(crumbs, locale);

  const seen = new Set<string>();
  const faqs: CategoryFaqItem[] = [];
  for (const service of data.category.services) {
    for (const faq of service.faqs) {
      if (!faq.answer || seen.has(faq.question)) continue;
      seen.add(faq.question);
      faqs.push({ question: faq.question, answer: faq.answer });
    }
  }

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <CategoryJsonLd crumbs={absoluteCrumbs} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:pb-16">
        <CategoryHeader
          category={data.category}
          group={data.group}
          crumbs={crumbs}
        />

        <CategoryDetails category={data.category} locale={locale} />

        {/* Treatment photos: cover image + before/after/gallery shots. */}
        <CategoryGallery category={data.category} />

        <CategoryFaq faqs={faqs} />
      </div>
    </div>
  );
}
