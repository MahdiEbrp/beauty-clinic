"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import PricingCta from "./PricingCta";
import PricingFaq from "./PricingFaq";
import PricingHeader from "./PricingHeader";
import PricingJumpNav from "./PricingJumpNav";
import PricingSearch from "./PricingSearch";
import PricingSection from "./PricingSection";
import type { PricingPageData } from "@/lib/services/pricing-page";

type PricingArticleProps = {
  data: PricingPageData;
  dir?: "ltr" | "rtl";
};

type TabId = "injection" | "laser" | "hifu" | "tattoo";

/** Number of sections rendered in the right column (top-to-bottom). */
const RIGHT_COLUMN_COUNT = 4;

/**
 * Top-level pricing article rendering the DB view model.
 *
 * Layout: two-column grid. Right column rendered first (top-to-bottom),
 * then left column (top-to-bottom), per the reference pricing page.
 * Each section is a card with a "خدمات | قیمت (تومان)" table — no
 * reservation buttons appear on the pricing page.
 */
export default function PricingArticle({
  data,
  dir,
}: PricingArticleProps) {
  const t = useTranslations();
  const locale = useLocale();
  const resolvedDir: "ltr" | "rtl" = dir ?? (locale === "fa" ? "rtl" : "ltr");
  const [tab, setTab] = useState<"injection" | "laser" | "hifu" | "tattoo">(
    "injection"
  );

  const LASER_SLUG = "laser-hair-removal";
  const HIFU_SLUG = "hifu";
  const TATTOO_SLUG = "tattoo-removal-skin-brightening";

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

  const groupsFor = (id: string) => {
    if (id === "laser") return data.groups.filter((g) => g.slug === LASER_SLUG);
    if (id === "hifu") return data.groups.filter((g) => g.slug === HIFU_SLUG);
    if (id === "tattoo") return data.groups.filter((g) => g.slug === TATTOO_SLUG);
    return data.groups.filter((g) => INJECTION_SLUGS.has(g.slug));
  };

  const activeGroups = groupsFor(tab).sort(
    (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
  );

  const tabs: { id: string; label: string }[] = [
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

  // Split into right column (first N groups) and left column (rest)
  const rightColumnGroups = activeGroups.slice(0, RIGHT_COLUMN_COUNT);
  const leftColumnGroups = activeGroups.slice(RIGHT_COLUMN_COUNT);

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
                onClick={() => setTab(entry.id as TabId)}
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

            <main className="flex-1 w-full min-w-0">
              {/* Two-column section grid: right column first, then left column */}
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                style={{ direction: resolvedDir }}
              >
                <div className="space-y-8 lg:space-y-8">
                  {rightColumnGroups.map((group, index) => (
                    <PricingSection
                      key={group.slug}
                      group={group}
                      index={index}
                    />
                  ))}
                </div>
                <div className="space-y-8 lg:space-y-8">
                  {leftColumnGroups.map((group, index) => (
                    <PricingSection
                      key={group.slug}
                      group={group}
                      index={rightColumnGroups.length + index}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-8 pt-4 lg:pt-0">
                <PricingFaq faqs={data.faqs} heading={t("pricing.faq.heading")} />
                <PricingCta cta={data.cta} onPrimaryClick={undefined} />
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
