import React from "react";
import { CalendarPlus, Clock, Repeat, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import PriceTag from "@/components/pricing/PriceTag";
import { formatNumber } from "@/lib/services/format";
import type { PricingService } from "@/lib/services/pricing-page";

export type PricingRowProps = {
  key?: React.Key;
  service: PricingService;
  currency?: string;
  onBook?: (service: PricingService) => void;
  /** Owning group slug — when set, the row is anchored at `#pricing-<groupSlug>-<serviceSlug>`. */
  groupSlug?: string;
  /** Larger, more prominent reserve button (used on SEO category pages). */
  bookVariant?: "default" | "xl";
};

/** A single responsive pricing row: name + optional desc/price (right, RTL-aware). */
export default function PricingRow({
  service,
  currency = "",
  onBook,
  groupSlug,
  bookVariant = "default",
}: PricingRowProps) {
  const t = useTranslations();
  const minutesLabel = t("pricing.article.minutes");
  const sessionsLabel = t("pricing.article.sessions", { count: service.sessionsCount });
  const isXl = bookVariant === "xl";

  return (
    <li
      id={groupSlug ? `pricing-${groupSlug}-${service.slug}` : undefined}
      className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-surface-tertiary/20 -mx-3 px-3 rounded-lg transition-colors scroll-mt-24"
    >
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-accent group-hover:text-primary-deep transition-colors">
            {service.title}
          </span>
          {service.isFeatured ? (
            <span className="px-2 py-0.5 rounded-full bg-copper/15 text-copper-strong text-[11px] font-bold border border-copper/30">
              {t("pricing.article.featured")}
            </span>
          ) : null}
        </div>
        {service.shortDesc ? (
          <p className="text-xs sm:text-dash-body-sm text-content-secondary leading-normal max-w-2xl">
            {service.shortDesc}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-content-tertiary font-medium">
          {service.durationMin ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-copper" aria-hidden="true" />
              {`${formatNumber(service.durationMin)} ${minutesLabel}`}
            </span>
          ) : null}
          {service.sessionsCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Repeat className="size-3 text-copper" aria-hidden="true" />
              {sessionsLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3 text-copper" aria-hidden="true" />
            {t("pricing.article.certified")}
          </span>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-primary/40">
        <PriceTag
          price={service.price}
          priceType={service.priceType}
          currency={currency}
          className="text-base font-extrabold text-accent"
        />
        {onBook && (
          <button
            type="button"
            onClick={() => onBook(service)}
            className={
              isXl
                ? "inline-flex min-h-12 items-center gap-2 rounded-pill bg-accent px-6 py-2.5 text-sm font-bold text-on-primary shadow-elevation-2 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
                : "inline-flex items-center gap-1.5 rounded-pill bg-accent px-3.5 py-1.5 text-xs font-bold text-on-primary hover:bg-accent-hover transition-colors shadow-sm"
            }
          >
            {isXl ? (
              <CalendarPlus className="size-4" aria-hidden="true" />
            ) : null}
            {t("pricing.article.book")}
          </button>
        )}
      </div>
    </li>
  );
}
export { PricingRow };
