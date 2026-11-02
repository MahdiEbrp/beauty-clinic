import React from "react";
import type { PricingGroup, PricingService } from "@/lib/services/pricing-page";

export type PricingSectionProps = {
  key?: React.Key;
  group: PricingGroup;
  index?: number;
};

/**
 * One pricing section per DB group, rendered as a two-column table:
 * خدمات | قیمت (تومان).
 *
 * Anchored at `#pricing-<slug>` so the jump-nav can deep-link.
 */
export default function PricingSection({
  group,
  index = 0,
}: PricingSectionProps) {
  // Flatten all services across categories, preserving displayOrder
  const services: PricingService[] = group.categories
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .flatMap((cat) =>
      cat.services.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    );

  const formatPrice = (s: PricingService): string => {
    if (s.price === null) return "قیمت از طریق تماس";
    const n = Math.round(Number(s.price));
    return n.toLocaleString("fa-IR") + " تومان";
  };

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

      <div className="mt-4 overflow-hidden rounded-control border border-border-interactive bg-surface-secondary">
        <table className="w-full text-left rtl:text-right">
          <thead>
            <tr className="border-b border-border-interactive bg-surface-secondary/50">
              <th className="px-4 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wider">
                خدمات
              </th>
              <th className="px-4 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wider text-end rtl:text-start">
                قیمت (تومان)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-interactive/30">
            {services.map((service) => (
              <tr
                key={service.id}
                id={`pricing-${group.slug}-${service.slug}`}
                className="hover:bg-surface-tertiary/20 transition-colors"
              >
                <td className="px-4 py-3 text-body-sm text-content-primary">
                  {service.title}
                </td>
                <td className="px-4 py-3 text-body-sm font-extrabold text-accent text-end rtl:text-start tabular-nums">
                  {formatPrice(service)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export { PricingSection };
