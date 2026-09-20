import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import CategoryHeader from "./CategoryHeader";
import CategoryServices from "./CategoryServices";
import CategorySiblings from "./CategorySiblings";
import CategoryFaq, { type CategoryFaqItem } from "./CategoryFaq";
import CategoryJsonLd, { type BreadcrumbItem } from "./CategoryJsonLd";
import CategoryBookingCta from "./CategoryBookingCta";
import FloatingBookingButton from "@/components/FloatingBookingButton";
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

/**
 * Assembles every block of a single service-category page:
 * breadcrumb + header, the pricing-style service list, a "more in group"
 * rail, and the aggregated FAQ. The services reuse the pricing page's rows so
 * prices, duration/session badges and the book action stay visually identical.
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

        <CategoryServices
          category={data.category}
          groupSlug={data.group.slug}
          currency={data.currency}
        />

        <CategoryBookingCta locale={locale} />

        <CategorySiblings group={data.group} siblings={data.siblings} />

        <CategoryFaq faqs={faqs} />
      </div>

      <FloatingBookingButton />
    </div>
  );
}