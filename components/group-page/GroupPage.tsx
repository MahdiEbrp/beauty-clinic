import { getTranslations } from "next-intl/server";
import { pageUrl } from "@/lib/site";
import GroupHeader from "./GroupHeader";
import GroupCategories from "./GroupCategories";
import GroupFeatured from "./GroupFeatured";
import CategoryFaq from "@/components/category-page/CategoryFaq";
import CategoryJsonLd, { type BreadcrumbItem } from "@/components/category-page/CategoryJsonLd";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import type { GroupPageData } from "@/lib/services/group-page";

type GroupPageProps = {
  data: GroupPageData;
  locale: string;
};

export default async function GroupPage({ data, locale }: GroupPageProps) {
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const crumbs: BreadcrumbItem[] = [
    { label: t("breadcrumb.home"), href: "/" },
    { label: t("breadcrumb.services"), href: "/services" },
    { label: data.group.title, href: `/services/${data.group.slug}` },
  ];
  const absoluteCrumbs = crumbs.map((crumb) => ({
    label: crumb.label,
    href: pageUrl(locale, crumb.href),
  }));

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <CategoryJsonLd crumbs={absoluteCrumbs} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:pb-16">
        <GroupHeader group={data.group} crumbs={crumbs} />

        <GroupCategories groupSlug={data.group.slug} categories={data.categories} />

        <GroupFeatured
          groupSlug={data.group.slug}
          services={data.featured}
          currency={data.currency}
        />

        <CategoryFaq faqs={data.faqs} />
      </div>

      <FloatingBookingButton />
    </div>
  );
}