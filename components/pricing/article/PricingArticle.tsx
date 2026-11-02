"use client";

import { useState } from "react";
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

/** Price-list categories — the clinic's top-level grouping on the pricing page. */
const INJECTION_SLUGS = new Set([
  "face-filler",
  "full-face-filler",
  "botox",
  "enzyme",
  "body-filler",
  "meso-gel-rejuvenation",
  "hair-mesotherapy",
  "meso-fatburn",
  "skin-treatments",
  "face-thread-lift",
]);
const LASER_SLUG = "laser-hair-removal";
const HIFU_SLUG = "hifu";
const TATTOO_SLUG = "tattoo-removal-skin-brightening";

type TabId = "injection" | "laser" | "hifu" | "tattoo";

/**
 * Top-level pricing article rendering the DB view model.
 *
 * The catalog is split into four price-list tabs (injection services, laser
 * hair removal, HIFU, tattoo removal). Only the active tab's groups are
 * rendered, searched and linked in the jump nav.
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
  const [tab, setTab] = useState<TabId>("injection");

  const handleBook: (service: PricingService) => void =
    onBookService ??
    ((service) => router.push(`/booking?service=${service.slug}`));

  const groupsFor = (id: TabId) => {
    if (id === "laser") return data.groups.filter((g) => g.slug === LASER_SLUG);
    if (id === "hifu") return data.groups.filter((g) => g.slug === HIFU_SLUG);
    if (id === "tattoo") return data.groups.filter((g) => g.slug === TATTOO_SLUG);
    return data.groups.filter((g) => INJECTION_SLUGS.has(g.slug));
  };

  const activeGroups = groupsFor(tab);
  const tabs: { id: TabId; label: string }[] = [
    { id: "injection", label: t("pricing.tabs.injection") },
    { id: "laser", label: t("pricing.tabs.laser") },
    { id: "hifu", label: t("pricing.tabs.hifu") },
    { id: "tattoo", label: t("pricing.tabs.tattoo") },
  ];

  const groupLinks = activeGroups.map((group) => ({
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

        <div
          role="tablist"
          aria-label={t("pricing.tabs.label")}
          className="flex flex-wrap gap-2 rounded-panel border border-border-primary bg-surface-secondary/70 p-2 shadow-xs"
        >
          {tabs.map((entry) => {
            const active = entry.id === tab;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(entry.id)}
                className="min-h-11 flex-1 cursor-pointer rounded-control px-4 text-body-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={
                  active
                    ? { backgroundColor: "var(--color-accent)", color: "var(--color-content-contrast)" }
                    : undefined
                }
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        <PricingSearch
          groups={groupLinks}
          entries={data.search.filter((entry) =>
            activeGroups.some((group) => group.slug === entry.groupSlug),
          )}
          placeholder={t("pricing.search.placeholder")}
          label={t("pricing.search.label")}
          clearLabel={t("pricing.search.clear")}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col lg:flex-row gap-8 items-start pt-4">
        {activeGroups.length > 0 ? (
          <>
            <PricingJumpNav
              groups={groupLinks}
              label={t("pricing.jump.label")}
              sectionsLabel={t("pricing.jump.sections", { count: groupLinks.length })}
              scrollTopLabel={t("pricing.jump.scrollTop")}
              itemLabel={t("pricing.jump.itemLabel", { title: data.page.title })}
              dir={resolvedDir}
            />

            <main className="flex-1 w-full space-y-8 min-w-0">
              {activeGroups.map((group, index) => (
                <PricingSection
                  key={group.slug}
                  group={group}
                  currency={data.currency}
                  index={index}
                />
              ))}

              <div className="space-y-8 pt-4">
                <PricingFaq faqs={data.faqs} heading={t("pricing.faq.heading")} />
                <PricingCta
                  cta={data.cta}
                  onPrimaryClick={
                    activeGroups[0]?.categories[0]?.services[0]
                      ? () => handleBook(activeGroups[0].categories[0].services[0])
                      : undefined
                  }
                />
              </div>
            </main>
          </>
        ) : (
          <div className="mx-auto w-full max-w-xl rounded-panel border border-dashed border-border-primary bg-surface-secondary p-12 text-center">
            <p className="text-body font-bold text-content-primary">
              {t("pricing.tabs.emptyTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-body-sm text-content-secondary">
              {t("pricing.tabs.emptyDesc")}
            </p>
          </div>
        )}
      </div>

      <FloatingBookingButton />
    </div>
  );
}
