import React from "react";
import type { PricingGroup, PricingService } from "@/lib/services/pricing-page";

export type PricingSectionProps = {
  key?: React.Key;
  group: PricingGroup;
  index?: number;
};

/**
 * One pricing section per DB group, rendered as a compact two-column table:
 * خدمات | قیمت (تومان).
 *
 * No descriptions, no category cards — just group title + flat table.
 * Anchored at `#pricing-<slug>` for deep linking.
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
    const prefix = s.priceType === "from" ? "از " : "";
    return `${prefix}${n.toLocaleString("fa-IR")} تومان`;
  };

  return (
    <section
      id={`pricing-${group.slug}`}
      className="scroll-mt-24 rounded-card border border-border-primary bg-surface-secondary/90 p-4 sm:p-6 shadow-elevation-1"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-copper/10 text-[10px] font-bold text-copper-strong">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-xl font-bold text-accent tracking-tight">
          {group.title}
        </h3>
      </div>

      <div className="overflow-hidden rounded-control border border-border-interactive bg-surface-secondary">
        <table className="w-full text-left rtl:text-right text-sm">
          <thead>
            <tr className="border-b border-border-interactive bg-surface-secondary/50">
              <th className="px-3 py-2 text-xs font-bold text-content-tertiary uppercase tracking-wider">
                خدمات
              </th>
              <th className="px-3 py-2 text-xs font-bold text-content-tertiary uppercase tracking-wider text-end rtl:text-start">
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
                <td className="px-3 py-2 text-body-sm text-content-primary">
                  {service.title}
                </td>
                <td className="px-3 py-2 text-body-sm font-extrabold text-accent text-end rtl:text-start tabular-nums">
                  {formatPrice(service)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export { PricingSection };
