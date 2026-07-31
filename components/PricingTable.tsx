"use client";

import { useTranslations, useLocale } from "next-intl";
import type { PricingItem } from "@/data/pricing/filler";

interface PricingTableProps {
  items: readonly PricingItem[];
  namespace: string;
}

export default function PricingTable({ items, namespace }: PricingTableProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="flex flex-wrap gap-3" role="list">
      {items.map((item) => (
        <div
          key={item.nameKey}
          role="listitem"
          className="flex items-center justify-between gap-4 min-w-[200px] flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.375rem)] md:basis-auto bg-surface-primary border border-border-primary rounded-control px-4 py-3 transition-all duration-200 hover:border-border-interactive hover:shadow-elevation-1"
        >
          <span className="font-medium text-content-primary text-sm">
            {t(`${namespace}.${item.nameKey}`)}
          </span>
          <span className="num-intl font-bold text-copper-strong tabular-nums text-sm whitespace-nowrap">
            {formatPrice(item.price)}
            <span className="text-xs text-content-tertiary me-1">
              {t("common.currency")}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
