import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import GroupHeader from "@/components/group-page/GroupHeader";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import CategoryJsonLd from "./CategoryJsonLd";
import CategoryFaq, { type CategoryFaqItem } from "./CategoryFaq";
import CategoryGallery from "./CategoryGallery";
import CategoryDetails from "./CategoryDetails";
import type { CategoryPageData } from "@/lib/services/category-page";
import type { GroupPageGroup } from "@/lib/services/group-page";

type CategoryPageProps = {
  data: CategoryPageData;
  locale: string;
};

type BreadcrumbItem = {
  label: string;
  href: string;
};

function toCrumbs(
  data: CategoryPageData,
  tHome: string,
  tServices: string,
): BreadcrumbItem[] {
  return [
    { label: tHome, href: "/" },
    { label: tServices, href: "/services" },
    { label: data.group.title, href: `/services/${data.group.slug}` },
    {
      label: data.category.title,
      href: `/services/${data.group.slug}/${data.category.slug}`,
    },
  ];
}

function toAbsoluteCrumbs(
  crumbs: BreadcrumbItem[],
  locale: string,
): BreadcrumbItem[] {
  return crumbs.map((crumb) => ({
    label: crumb.label,
    href: pageUrl(locale, crumb.href),
  }));
}

/**
 * Category detail pages share the same page shell and header treatment as a
 * leaf group page, while retaining category-specific services, gallery and FAQs.
 */
export default async function CategoryPage({
  data,
  locale,
}: CategoryPageProps) {
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const crumbs = toCrumbs(data, t("breadcrumb.home"), t("breadcrumb.services"));
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

  const headerGroup: GroupPageGroup = {
    slug: data.category.slug,
    icon: data.category.icon,
    image: data.category.image,
    title: data.category.title,
    description: data.category.description,
    seoTitle: data.category.seoTitle,
    seoDescription: data.category.seoDescription,
    updatedAt: data.category.updatedAt,
  };

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <CategoryJsonLd crumbs={absoluteCrumbs} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:pb-16">
        <GroupHeader group={headerGroup} crumbs={crumbs} />
        <CategoryDetails category={data.category} locale={locale} />
        <CategoryGallery category={data.category} />
        <CategoryFaq faqs={faqs} />
      </div>
      <FloatingBookingButton />
    </div>
  );
}
