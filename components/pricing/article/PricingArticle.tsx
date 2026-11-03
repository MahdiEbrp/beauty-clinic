"use client";

import { useLocale, useTranslations } from "next-intl";
import PricingHeader from "./PricingHeader";
import PricingFaq from "./PricingFaq";
import PricingSection from "./PricingSection";
import type { PricingPageData } from "@/lib/services/pricing-page";

type PricingArticleProps = {
  data: PricingPageData;
  dir?: "ltr" | "rtl";
};

/** Number of sections rendered in the right column (top-to-bottom). */
const RIGHT_COLUMN_COUNT = 4;

/**
 * Top-level pricing article rendering the DB view model.
 *
 * Layout: two-column grid. Right column rendered first (top-to-bottom),
 * then left column (top-to-bottom), per the reference pricing page.
 * Each section is a compact card with a "خدمات | قیمت (تومان)" table.
 * No reservation buttons, no jump nav, no search, no badge, no tabs.
 */
export default function PricingArticle({
  data,
  dir,
}: PricingArticleProps) {
  const t = useTranslations();
  const locale = useLocale();
  const resolvedDir: "ltr" | "rtl" = dir ?? (locale === "fa" ? "rtl" : "ltr");

  // All groups sorted by displayOrder; split into right/left columns
  const activeGroups = data.groups.sort(
    (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
  );

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
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col lg:flex-row gap-8 items-start pt-4">
        {activeGroups.length > 0 ? (
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
            </div>
          </main>
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
    </div>
  );
}
