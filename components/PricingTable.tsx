"use client";

import { useTranslations } from "next-intl";
import type { PricingItem } from "@/data/pricing/filler";

interface PricingTableProps {
  items: readonly PricingItem[];
  namespace: string;
}

export default function PricingTable({ items, namespace }: PricingTableProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap gap-3" role="list">
      {items.map((item) => (
        <div
          key={item.nameKey}
          role="listitem"
          className="flex items-center justify-between gap-4 min-w-50 flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.375rem)] md:basis-auto bg-surface-primary border border-border-primary rounded-control px-4 py-3 transition-all duration-200 hover:border-border-interactive hover:shadow-elevation-1"
        >
          <span className="font-medium text-content-primary text-body-sm">
            {t(`${namespace}.${item.nameKey}`)}
          </span>
          <span className="font-bold text-copper-strong text-body-sm whitespace-nowrap">
            {item.price.toLocaleString("en")}
            <span className="text-caption text-content-tertiary me-1">
              {t("common.currency")}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
