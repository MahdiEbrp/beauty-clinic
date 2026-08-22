"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus, Clock, Repeat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { pricingImage } from "@/data/pricing-media";
import type { CategoryCardData } from "./data";
import { categoryPriceRange } from "./price-range";
import PriceTag from "./PriceTag";
import ServiceImage from "./ServiceImage";
import ServiceMeta from "./ServiceMeta";

type CategoryDetailDialogProps = {
  open: boolean;
  card: CategoryCardData | null;
  currency: string;
  onClose: () => void;
  onBook: (serviceSlug: string) => void;
};

/**
 * Responsive detail dialog opened from a `CategoryCard`. Mirrors the card's
 * visual language (image band, price badge, group glyph, meta row) and then
 * lists every service in the category with its price, description and a
 * per-service Book CTA. Enter-only animation; unmounted when closed.
 */
export default function CategoryDetailDialog({
  open,
  card,
  currency,
  onClose,
  onBook,
}: CategoryDetailDialogProps) {
  const t = useTranslations();

  if (!open || !card) return null;

  const priceLabel = categoryPriceRange(card, t, currency);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        closeLabel={t("nav.closeMenu")}
        className="w-full max-w-[calc(100%-2rem)] p-0 sm:max-w-2xl lg:max-w-4xl"
        overlayClassName="data-[state=open]:animate-fade-in"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">{card.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {card.description ?? ""}
          </DialogDescription>
        </DialogHeader>

        {/* Header image band — mirrors the pricing card's top strip. */}
        <div className="relative aspect-21/9 w-full max-h-64 overflow-hidden">
          <img
            src={pricingImage(card.image)}
            alt={card.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 864px"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/20 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-surface-secondary/20 text-content-contrast backdrop-blur-sm">
              <GroupGlyph
                name={card.icon ?? "Sparkles"}
                className="size-5"
                strokeWidth={1.75}
              />
            </span>
            <span className="rounded-full bg-copper px-3 py-1 text-caption font-bold text-content-contrast shadow-elevation-2">
              {priceLabel}
            </span>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <h2 className="text-heading-2 font-bold text-accent">{card.title}</h2>
          <p className="mt-1 text-caption font-medium text-content-tertiary">
            {card.groupTitle}
          </p>
          {card.description ? (
            <p className="mt-3 line-clamp-2 text-body text-content-secondary leading-relaxed">
              {card.description}
            </p>
          ) : null}

          {/* Category-level meta (estimated duration + option count). */}
          <div className="mt-4 flex flex-wrap items-center gap-4 gap-y-1.5 text-caption text-content-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {card.durationMin} {t("serviceDetail.labels.minutes")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Repeat className="size-4" aria-hidden="true" />
              {t("pricing.card.options", { count: card.optionsCount })}
            </span>
          </div>

          {/* Per-service list: price + short info + Book CTA. */}
          <h3 className="mt-6 text-heading-3 font-bold text-accent">
            {t("pricing.detail.services")}
          </h3>

          {card.services.length === 0 ? (
            <p className="mt-4 text-body-sm text-content-tertiary">
              {t("pricing.detail.noServices")}
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {card.services.map((service) => (
                <li
                  key={service.slug}
                  className="rounded-card border border-border-primary bg-surface-tertiary/30 p-4 shadow-elevation-1"
                >
                  <div className="relative mb-3 aspect-4/3 w-full overflow-hidden rounded-control">
                    <ServiceImage
                      src={service.coverImage}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-heading-3 font-bold text-accent">
                    {service.title}
                  </h4>
                  <div className="mt-1">
                    <PriceTag
                      price={service.price}
                      priceType={service.priceType}
                      currency={currency}
                      className="text-body font-bold text-copper-deep"
                    />
                  </div>
                  {service.shortDesc ? (
                    <p className="mt-2 line-clamp-2 text-body-sm text-content-secondary leading-relaxed">
                      {service.shortDesc}
                    </p>
                  ) : null}
                  <ServiceMeta
                    durationMin={service.durationMin}
                    sessionsCount={service.sessionsCount}
                  />
                  <button
                    type="button"
                    onClick={() => onBook(service.slug)}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-body-sm font-bold text-content-contrast shadow-elevation-2 transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <CalendarPlus className="size-4" aria-hidden="true" />
                    {t("serviceDetail.labels.bookNow")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
