"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarPlus,
  Clock,
  ImageOff,
  Repeat,
  Search,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GroupGlyph from "@/components/create-group/GroupGlyph";
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
 * Responsive detail dialog opened from a `CategoryCard`. Compact header strip
 * (icon + title + price, no oversized image band), then a dense, responsive
 * grid of services as slim rows: small thumbnail, title/price/meta inline,
 * and a compact Book action. Scrolls internally so it never overflows the
 * viewport. Enter-only animation; unmounted when closed.
 */
export default function CategoryDetailDialog({
  open,
  card,
  currency,
  onClose,
  onBook,
}: CategoryDetailDialogProps) {
  const t = useTranslations();
  const [query, setQuery] = useState("");

  if (!open || !card) return null;

  const priceLabel = categoryPriceRange(card, t, currency);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredServices = normalizedQuery
    ? card.services.filter((service) =>
      `${service.title} ${service.shortDesc ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
    : card.services;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        closeLabel={t("nav.closeMenu")}
        className="flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-card p-0 sm:max-w-xl lg:max-w-2xl"
        overlayClassName="data-[state=open]:animate-fade-in"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">{card.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {card.description ?? ""}
          </DialogDescription>
        </DialogHeader>

        {/* Compact header — icon, title/meta, price badge. No big image band. */}
        <div className="flex shrink-0 items-start gap-3 rounded-t-card border-b border-border-primary bg-surface-tertiary/40 p-4 pt-5 sm:p-5 sm:pt-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-copper/15 text-copper-deep">
            <GroupGlyph
              name={card.icon ?? "Sparkles"}
              className="size-5"
              strokeWidth={1.75}
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-heading-3 font-bold text-accent leading-tight">
                {card.title}
              </h2>
              <span className="shrink-0 rounded-full bg-copper px-2.5 py-1 text-caption font-bold text-content-contrast">
                {priceLabel}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-content-tertiary">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {card.durationMin} {t("serviceDetail.labels.minutes")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Repeat className="size-3.5" aria-hidden="true" />
                {t("pricing.card.options", { count: card.optionsCount })}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable body: description + search + service list. */}
        <div className="overflow-y-auto p-4 sm:p-5">
          {card.description ? (
            <p className="text-body-sm text-content-secondary leading-relaxed">
              {card.description}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-2">
            <h3 className="text-caption font-bold uppercase tracking-wide text-content-tertiary">
              {t("pricing.detail.services")}
            </h3>
            {normalizedQuery ? (
              <span className="text-caption text-content-tertiary">
                {filteredServices.length}/{card.services.length}
              </span>
            ) : null}
          </div>

          {/* Search box for filtering services by name/description. */}
          {card.services.length > 4 ? (
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                // TODO: replace with t("pricing.detail.searchServices") once that
                // key exists in the messages files — next-intl has no built-in
                // fallback, so an unknown key renders as the literal key string.
                placeholder="Search treatments…"
                aria-label="Search treatments"
                className="h-10 w-full rounded-pill border border-border-primary bg-surface-primary pl-9 pr-9 text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  // TODO: replace with t("common.clear") once that key exists.
                  aria-label="Clear"
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-content-tertiary hover:bg-surface-tertiary hover:text-content-primary"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}

          {filteredServices.length === 0 ? (
            <p className="mt-3 text-body-sm text-content-tertiary">
              {normalizedQuery
                ? // TODO: replace with t("pricing.detail.noResults") once that key exists.
                "No matching services"
                : t("pricing.detail.noServices")}
            </p>
          ) : (
            <ul className="mt-2 flex flex-col divide-y divide-border-primary">
              {filteredServices.map((service) => (
                <ServiceRow
                  key={service.slug}
                  service={service}
                  currency={currency}
                  onBook={onBook}
                  bookLabel={t("serviceDetail.labels.bookNow")}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ServiceRowProps = {
  service: CategoryCardData["services"][number];
  currency: string;
  bookLabel: string;
  onBook: (serviceSlug: string) => void;
};

/**
 * Single service row. Title and description truncate to one line by default;
 * since a hard cut with no way to read the rest is a dead end (especially on
 * touch, where there's no hover), tapping the text row expands it in place.
 * Desktop users can also hover for a native title tooltip.
 */
function ServiceRow({ service, currency, bookLabel, onBook }: ServiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMoreText = Boolean(service.shortDesc) || service.title.length > 40;

  return (
    <li className="flex items-center gap-3 py-3 first:pt-2">
      {/* Small fixed-size thumbnail with graceful fallback — no blank boxes. */}
      <div className="relative size-14 shrink-0 overflow-hidden rounded-control bg-surface-tertiary sm:size-16">
        {service.coverImage ? (
          <ServiceImage
            src={service.coverImage}
            alt={service.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-content-tertiary/50">
            <ImageOff className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => hasMoreText && setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className={`min-w-0 flex-1 text-left ${hasMoreText ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h4
            title={service.title}
            className={`text-body-sm font-bold text-accent ${expanded ? "" : "truncate"}`}
          >
            {service.title}
          </h4>
          <PriceTag
            price={service.price}
            priceType={service.priceType}
            currency={currency}
            className="shrink-0 text-body-sm font-bold text-copper-deep"
          />
        </div>
        {service.shortDesc ? (
          <p
            title={service.shortDesc}
            className={`mt-0.5 text-caption text-content-tertiary ${expanded ? "" : "truncate"}`}
          >
            {service.shortDesc}
          </p>
        ) : null}
        <ServiceMeta
          durationMin={service.durationMin}
          sessionsCount={service.sessionsCount}
        />
      </button>

      <button
        type="button"
        onClick={() => onBook(service.slug)}
        aria-label={`${bookLabel} — ${service.title}`}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-9 sm:w-auto sm:gap-1.5 sm:rounded-pill sm:px-3.5"
      >
        <CalendarPlus className="size-4" aria-hidden="true" />
        <span className="hidden text-caption font-bold sm:inline">{bookLabel}</span>
      </button>
    </li>
  );
}