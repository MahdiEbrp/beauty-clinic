import type { ReactNode } from "react";

import {
  ArrowUpRight,
  BookOpen,
  HeartPulse,
  Sparkles,
} from "lucide-react";

import { getTranslations } from "next-intl/server";

import { getCareGuidesForPublic } from "@/lib/services/service";

import type {
  PublicCareGuide,
  PublicCareGuideItem,
} from "@/lib/services/care-guides-types";

import type { Locale } from "@/lib/services/types";

function ItemIcon({ item }: { item: PublicCareGuideItem; }) {
  const Icon = item.highlighted ? HeartPulse : Sparkles;

  return (
    <div
      className={[
        "flex size-10 shrink-0 items-center justify-center rounded-control",
        "border transition-colors duration-300",
        item.highlighted
          ? "border-warning/50 bg-warning/15 text-warning"
          : "border-copper/50 bg-copper/15 text-copper-strong group-hover/item:bg-copper/25",
      ].join(" ")}
    >
      <Icon className="size-4.5" strokeWidth={2} aria-hidden="true" />
    </div>
  );
}

function GuideSection({
  guide,
  highlightedLabel,
  normalLabel,
  index,
}: {
  guide: PublicCareGuide;
  highlightedLabel: string;
  normalLabel: string;
  index: number;
}) {
  return (
    <article className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-3">
      {/* Header — stays on the dark brand surface, acts as the "cover" */}
      <header className="relative bg-accent">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-8 sm:py-7">
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-card border border-gold/40 bg-primary-deep text-gold sm:size-12">
              <BookOpen className="size-4.5 sm:size-5" strokeWidth={1.8} aria-hidden="true" />

              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-pill bg-gold text-[10px] font-bold text-primary-deep sm:size-6 sm:text-[11px]">
                {index + 1}
              </span>
            </div>

            <div className="min-w-0 pt-0.5 sm:pt-0">
              <h2 className="text-lg font-bold leading-tight text-content-contrast sm:text-heading-2">
                {guide.name}
              </h2>

              {guide.description && (
                <p className="mt-1 max-w-2xl text-body-sm leading-relaxed text-footer-text">
                  {guide.description}
                </p>
              )}
            </div>
          </div>

          <a
            href="#"
            className="hidden size-9 shrink-0 items-center justify-center rounded-pill border border-gold/30 text-gold transition-colors hover:border-gold hover:bg-primary-deep sm:flex"
            aria-label={guide.name}
          >
            <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Items — light surface so the card has somewhere for the eye to rest */}
      {guide.items.length === 0 ? (
        <div className="px-6 py-10 text-center text-content-tertiary sm:px-8">
          {normalLabel}
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-border-primary sm:grid-cols-2 sm:divide-y-0">
          {guide.items.map((item, itemIndex) => {
            const isFirstColumn = itemIndex % 2 === 0;
            const isSecondRow = itemIndex >= 2;

            return (
              <div
                key={item.id}
                className={[
                  "group/item relative px-5 py-4 transition-colors duration-200 sm:px-8 sm:py-6",
                  "hover:bg-surface-primary",
                  isFirstColumn ? "sm:border-r sm:border-border-primary" : "",
                  isSecondRow ? "sm:border-t sm:border-border-primary" : "",
                ].join(" ")}
              >
                {/* accent bar that appears on hover instead of flashing the whole row */}
                <span className="absolute inset-y-0 left-0 w-0.5 scale-y-0 bg-copper transition-transform duration-200 group-hover/item:scale-y-100" />

                <div className="flex items-start gap-3 sm:gap-3.5">
                  <ItemIcon item={item} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold leading-snug text-content-primary sm:text-body-lg">
                        {item.title}
                      </h3>

                      <span className="hidden shrink-0 text-caption font-medium tabular-nums text-content-tertiary sm:inline">
                        {String(itemIndex + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {item.description?.length ? (
                      <p className="mt-1 text-body-sm leading-6 text-content-secondary sm:mt-1.5">
                        {item.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-body-sm italic leading-6 text-content-tertiary/80 sm:mt-1.5">
                        {normalLabel}
                      </p>
                    )}

                    {item.highlighted && (
                      <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-pill border border-warning/40 bg-warning/10 px-2.5 py-1 text-caption font-bold text-warning sm:mt-3">
                        <HeartPulse className="size-3" strokeWidth={2.5} aria-hidden="true" />
                        {highlightedLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default async function CareContent({
  locale,
}: {
  locale: string;
}): Promise<ReactNode> {
  const t = await getTranslations({
    locale,
    namespace: "care",
  });

  const guides = await getCareGuidesForPublic(locale as Locale, {
    status: "active",
  });

  return (
    <section className="bg-surface-primary py-20 md:py-24">
      <div className="mx-auto max-w-content px-6">
        {/* Page intro */}
        <div className="mb-14 max-w-prose md:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-pill border border-copper/30 bg-surface-secondary px-4 py-2 text-caption font-bold text-copper-strong">
            <Sparkles className="size-4" strokeWidth={1.8} aria-hidden="true" />
            <span>Care Guide</span>
          </div>

          <h1 className="text-heading-1 font-bold text-accent">{t("heading")}</h1>

          <div className="mt-5 flex items-start gap-4">
            <div className="mt-3 h-px w-10 shrink-0 bg-copper" />
            <p className="text-body-lg leading-8 text-content-secondary">
              {t("description")}
            </p>
          </div>
        </div>

        {/* Guides */}
        {guides.length === 0 ? (
          <div className="rounded-panel border border-border-primary bg-surface-secondary px-6 py-16 text-center text-content-secondary">
            {t("empty")}
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {guides.map((guide, index) => (
              <GuideSection
                key={guide.id}
                guide={guide}
                index={index}
                highlightedLabel={t("highlighted")}
                normalLabel={t("notProvided")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}