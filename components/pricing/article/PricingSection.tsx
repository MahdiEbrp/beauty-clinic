import React from "react";
import PricingCategory from "./PricingCategory";
import type { PricingGroup, PricingService } from "@/lib/services/pricing-page";

export type PricingSectionProps = {
  key?: React.Key;
  group: PricingGroup;
  currency?: string;
  index?: number;
  onBook?: (service: PricingService) => void;
};

/**
 * One pricing section per DB group, anchored at `#pricing-<slug>` so the
 * generated jump-nav can deep-link without any hardcoded ids.
 */
export default function PricingSection({
  group,
  currency = "",
  index = 0,
  onBook,
}: PricingSectionProps) {

  return (
    <article
      id={`pricing-${group.slug}`}
      className="scroll-mt-24 rounded-card border border-border-primary bg-surface-secondary/90 p-6 sm:p-8 shadow-elevation-1 transition-all"
    >
      <div className="flex flex-col gap-2 pb-5 border-b border-border-primary/60">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-copper/20 text-xs font-bold text-copper-strong">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-accent tracking-tight">
          {group.title}
        </h3>
        {group.description ? (
          <p className="text-dash-body text-content-secondary leading-relaxed max-w-2xl">
            {group.description}
          </p>
        ) : null}
      </div>

      <div className="mt-4 divide-y divide-border-primary/60">
        {group.categories.map((category) => (
          <PricingCategory
            key={category.slug}
            category={category}
            currency={currency}
            onBook={onBook}
          />
        ))}
      </div>
    </article>
  );
}
export { PricingSection };
