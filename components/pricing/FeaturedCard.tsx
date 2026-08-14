"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, CalendarPlus, Sparkles } from "lucide-react";
import type { PublicServiceRow } from "@/lib/services/types";
import PriceTag from "./PriceTag";
import ServiceImage from "./ServiceImage";
import ServiceMeta from "./ServiceMeta";

type FeaturedCardProps = {
  service: PublicServiceRow;
  onExpand: () => void;
  onBook: () => void;
};

/** Editorial hero block for the featured treatment. */
export default function FeaturedCard({
  service,
  onExpand,
  onBook,
}: FeaturedCardProps) {
  const t = useTranslations();
  const cover =
    service.coverImage ??
    service.images.find((image) => image.type === "gallery")?.imageUrl ??
    null;

  return (
    <article className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative min-h-56 md:min-h-full">
          <ServiceImage
            src={cover}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1.5 text-caption font-bold text-content-contrast shadow-elevation-2">
            <Sparkles className="size-4" aria-hidden="true" />
            {t("pricing.sections.featured")}
          </span>
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <h3 className="text-heading-2 font-bold text-accent">{service.title}</h3>
          {service.shortDesc ? (
            <p className="text-body text-content-secondary">{service.shortDesc}</p>
          ) : null}
          <ServiceMeta
            durationMin={service.durationMin}
            sessionsCount={service.sessionsCount}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <PriceTag
              price={service.price}
              priceType={service.priceType}
              className="text-heading-3 font-extrabold text-copper-deep"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onExpand}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border-2 border-border-interactive px-5 text-body-sm font-bold text-accent transition-colors hover:border-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ArrowUpRight className="size-5 rtl-mirror" aria-hidden="true" />
                {t("pricing.cta.details")}
              </button>
              <button
                type="button"
                onClick={onBook}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-copper bg-accent px-5 text-body-sm font-bold text-content-contrast transition-colors hover:bg-accent-hover hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <CalendarPlus className="size-5" aria-hidden="true" />
                {t("pricing.cta.book")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}