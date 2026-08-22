"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus, Clock, Eye, Repeat, ShoppingCart } from "lucide-react";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { pricingImage } from "@/data/pricing-media";
import type { CategoryCardData } from "./data";
import { categoryPriceRange } from "./price-range";

const MAX_CHIPS = 2;

type CategoryCardProps = {
  card: CategoryCardData;
  onBook: () => void;
  onDetails: () => void;
  /** Optional — the Add to cart button only renders when this is provided. */
  onAddToCart?: () => void;
  currency: string;
};

export default function CategoryCard({
  card,
  onBook,
  onDetails,
  onAddToCart,
  currency,
}: CategoryCardProps) {
  const t = useTranslations();

  const chips = card.services.slice(0, MAX_CHIPS);
  const remaining = card.services.length - chips.length;
  const priceLabel = categoryPriceRange(card, t, currency);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border-primary bg-primary-deep shadow-elevation-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevation-4">
      {/* Image band — fixed short height, not full-bleed */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        <img
          src={pricingImage(card.image)}
          alt={card.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/10 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-surface-secondary/20 text-content-contrast backdrop-blur-sm">
            <GroupGlyph name={card.icon ?? "Sparkles"} className="size-5" strokeWidth={1.75} />
          </span>
          <span className="rounded-full bg-copper px-3 py-1 text-caption font-bold text-content-contrast shadow-elevation-2">
            {priceLabel}
          </span>
        </div>
      </div>

      {/* Body — every row below is a fixed-height slot */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-content-contrast">
        {/* Title: clamped to 2 lines, min-height reserves that slot even
            for 1-line titles, so descriptions always start at the same y. */}
        <h3 className="mb-1.5 line-clamp-2 min-h-11 text-heading-3 font-bold leading-tight text-content-contrast">
          {card.title}
        </h3>

        {/* Description: clamped to 2 lines, min-height reserves the slot
            even when absent, so chips always start at the same y. */}
        <p className="mb-3 line-clamp-2 min-h-[2.4rem] text-body-sm text-content-contrast/85">
          {card.description ?? ""}
        </p>

        {/* Chips: max two topics in a wrap-friendly strip. The container
            reserves a fixed min-height slot, so a card showing one chip
            and a card showing two sit on the same baseline — long titles
            truncate instead of forcing a cramped single-line squeeze. */}
        <div className="mb-4 flex min-h-16 flex-wrap content-start gap-2 overflow-hidden">
          {chips.map((service) => (
            <span
              key={service.slug}
              className="inline-flex h-8 max-w-[calc(100%-0.5rem)] items-center rounded-full border border-white/15 bg-white/8 px-3 text-caption leading-none text-content-contrast/85 backdrop-blur-sm"
            >
              <span className="truncate">{service.title}</span>
            </span>
          ))}
          {remaining > 0 ? (
            <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-copper/40 bg-copper/15 px-3 text-caption font-semibold leading-none text-copper">
              +{remaining}
            </span>
          ) : null}
        </div>

        <div className="mb-4 flex h-5 items-center gap-4 text-caption text-content-contrast/75">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {card.durationMin} {t("serviceDetail.labels.minutes")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Repeat className="size-4" aria-hidden="true" />
            {t("pricing.card.options", { count: card.optionsCount })}
          </span>
        </div>
        <div className="mt-auto">
          <div className="mt-auto space-y-3">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-copper px-5 text-body-sm font-bold whitespace-nowrap text-content-contrast shadow-elevation-2 transition-all hover:bg-copper-strong active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <CalendarPlus className="size-5 shrink-0" aria-hidden="true" />
              <span>{t("pricing.cta.book")}</span>
            </button>

            <button
              type="button"
              onClick={onDetails}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-5 text-body-sm font-bold whitespace-nowrap text-accent transition-all hover:bg-surface-tertiary active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Eye className="size-5 shrink-0" aria-hidden="true" />
              {t("pricing.cta.details")}
            </button>

            {onAddToCart ? (
              <button
                type="button"
                onClick={onAddToCart}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill border border-copper/40 bg-copper/10 px-5 text-body-sm font-bold whitespace-nowrap text-copper transition-all hover:bg-copper/20 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                <ShoppingCart className="size-5 shrink-0" aria-hidden="true" />
                {t("pricing.cta.addToCart")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}