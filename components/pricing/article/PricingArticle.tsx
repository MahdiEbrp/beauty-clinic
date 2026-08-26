"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import PricingCta from "./PricingCta";
import PricingFaq from "./PricingFaq";
import PricingHeader from "./PricingHeader";
import PricingJumpNav from "./PricingJumpNav";
import PricingSearch from "./PricingSearch";
import PricingSection from "./PricingSection";
import type { PricingPageData, PricingService } from "@/lib/services/pricing-page";

type PricingArticleProps = {
  data: PricingPageData;
  onBookService?: (service: PricingService) => void;
  dir?: "ltr" | "rtl";
};

/**
 * Top-level pricing article rendering the DB view model.
 * - Large screens: sticky start-sidebar table of contents with active highlight & counts.
 * - Small screens: floating bottom navigation with a slide-up sheet.
 */
export default function PricingArticle({
  data,
  onBookService,
  dir,
}: PricingArticleProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const resolvedDir: "ltr" | "rtl" = dir ?? (locale === "fa" ? "rtl" : "ltr");

  const handleBook: (service: PricingService) => void =
    onBookService ??
    ((service) => router.push(`/booking?service=${service.slug}`));

  const groupLinks = data.groups.map((group) => ({
    slug: group.slug,
    title: group.title,
    count: group.categories.reduce((acc, cat) => acc + cat.services.length, 0),
  }));

  return (
    <div
      dir={resolvedDir}
      className="bg-surface-primary text-content-primary min-h-screen pb-24 lg:pb-16"
    >
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:px-6 space-y-6">
        <PricingHeader
          title={data.page.title}
          intro={data.page.intro}
          updatedLabel={data.page.updatedLabel}
          badgeLabel={t("pricing.badge")}
        />
        <PricingSearch
          groups={groupLinks}
          entries={data.search}
          placeholder={t("pricing.search.placeholder")}
          label={t("pricing.search.label")}
          clearLabel={t("pricing.search.clear")}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col lg:flex-row gap-8 items-start pt-4">
         <PricingJumpNav
           groups={groupLinks}
           label={t("pricing.jump.label")}
           sectionsLabel={t("pricing.jump.sections", { count: groupLinks.length })}
           scrollTopLabel={t("pricing.jump.scrollTop")}
            itemLabel={t("pricing.jump.itemLabel", { title: data.page.title })}
           dir={resolvedDir}
         />

         <main className="flex-1 w-full space-y-8 min-w-0">
           {data.groups.map((group, index) => (
             <PricingSection
               key={group.slug}
               group={group}
               currency={data.currency}
               index={index}
               onBook={handleBook}
             />
           ))}

          <div className="space-y-8 pt-4">
            <PricingFaq
              faqs={data.faqs}
              heading={t("pricing.faq.heading")}
            />
            <PricingCta
              cta={data.cta}
              onPrimaryClick={
                data.groups[0]?.categories[0]?.services[0]
                  ? () => handleBook(data.groups[0].categories[0].services[0])
                  : undefined
              }
            />
          </div>
        </main>
      </div>

      <FloatingBookingButton />
    </div>
  );
}
