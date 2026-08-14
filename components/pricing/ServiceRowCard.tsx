"use client";

import { ChevronDown } from "lucide-react";
import type { PublicServiceRow } from "@/lib/services/types";
import { cn } from "@/lib/utils";
import PriceTag from "./PriceTag";
import ServiceImage from "./ServiceImage";
import ServiceMeta from "./ServiceMeta";

type ServiceRowCardProps = {
  service: PublicServiceRow;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
};

/**
 * Horizontal service card — image on the start (right in RTL), content in the
 * middle, price + expand control on the end (left in RTL).
 */
export default function ServiceRowCard({
  service,
  expanded,
  detailId,
  onToggle,
}: ServiceRowCardProps) {
  const cover =
    service.coverImage ??
    service.images.find((image) => image.type === "gallery")?.imageUrl ??
    null;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-card border bg-surface-secondary transition-all",
        expanded
          ? "border-accent shadow-elevation-3"
          : "border-border-primary shadow-elevation-1 hover:border-border-interactive hover:shadow-elevation-2",
      )}
    >
      <div className="flex items-center gap-4 p-4 md:gap-6 md:p-5">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-control md:size-36">
          <ServiceImage
            src={cover}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 96px, 144px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body-lg font-bold text-accent">
            {service.title}
          </h3>
          {service.shortDesc ? (
            <p className="mt-1 hidden text-body-sm text-content-secondary sm:line-clamp-2 sm:block">
              {service.shortDesc}
            </p>
          ) : null}
          <div className="mt-2">
            <ServiceMeta
              durationMin={service.durationMin}
              sessionsCount={service.sessionsCount}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <PriceTag
            price={service.price}
            priceType={service.priceType}
            className="text-end text-body-sm font-extrabold text-copper-deep md:text-body"
            labelClassName="font-semibold"
          />
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={detailId}
            aria-label={service.title}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border-interactive text-accent transition-colors hover:border-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ChevronDown
              className={cn(
                "size-5 rtl-mirror transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </article>
  );
}