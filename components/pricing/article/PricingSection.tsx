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
 * Uses accent + copper brand colors for section numbering, titles,
 * table headers and prices. Surface tones keep the card grounded.
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
      className="scroll-mt-24 rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1 transition-all duration-300 group hover:border-copper-strong/50 hover:shadow-elevation-2 hover:-translate-y-0.5"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-border-interactive/40 pb-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-content-contrast text-[11px] font-bold tracking-tighter shadow-sm shadow-accent/20">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-xl font-extrabold text-accent tracking-tight">
          {group.title}
        </h3>
      </div>

      <div className="overflow-hidden rounded-control border border-border-interactive bg-surface-secondary/60">
        <table className="w-full text-left rtl:text-right text-sm">
          <thead>
            <tr className="border-b border-border-interactive bg-accent-subtle">
              <th className="px-3 py-2.5 text-xs font-bold text-accent uppercase tracking-wider">
                خدمات
              </th>
              <th className="px-3 py-2.5 text-xs font-bold text-accent uppercase tracking-wider text-end rtl:text-start">
                قیمت (تومان)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-interactive/40">
            {services.map((service) => (
              <tr
                key={service.id}
                id={`pricing-${group.slug}-${service.slug}`}
                className="hover:bg-copper/5 transition-colors group-hover:bg-copper-strong/10"
              >
                <td className="px-3 py-2.5 text-body-sm text-content-secondary">
                  {service.title}
                </td>
                <td className="px-3 py-2.5 text-body-sm font-extrabold text-accent text-end rtl:text-start tabular-nums group-hover:text-copper-strong">
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
