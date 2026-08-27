import React from "react";
import PricingRow from "./PricingRow";
import type { PricingCategory as PricingCategoryType, PricingService } from "@/lib/services/pricing-page";

export type PricingCategoryProps = {
  key?: React.Key;
  category: PricingCategoryType;
  currency?: string;
  onBook?: (service: PricingService) => void;
  /** Owning group slug, for per-service pricing anchors (`#pricing-<groupSlug>-<serviceSlug>`). */
  groupSlug?: string;
};

/** A category block with its service pricing rows. */
export default function PricingCategory({
  category,
  currency = "$",
  onBook,
  groupSlug,
}: PricingCategoryProps) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="mb-3">
        <h4 className="text-base font-bold text-accent">
          {category.title}
        </h4>
        {category.description ? (
          <p className="mt-0.5 text-xs text-content-tertiary">
            {category.description}
          </p>
        ) : null}
      </div>
      <ul className="divide-y divide-border-primary/50">
        {category.services.map((service) => (
          <PricingRow
            key={service.id}
            service={service}
            currency={currency}
            onBook={onBook}
            groupSlug={groupSlug}
          />
        ))}
      </ul>
    </div>
  );
}
export { PricingCategory };
