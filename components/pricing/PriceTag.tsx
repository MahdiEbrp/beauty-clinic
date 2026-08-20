"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/services/format";
import type { PriceType } from "@/lib/services/types";
import { cn } from "@/lib/utils";

type PriceTagProps = {
  price: number | null;
  priceType: PriceType;
  currency: string;
  className?: string;
  labelClassName?: string;
};

/**
 * Renders a price according to its type: fixed ("1,200,000 Toman"), from
 * ("From 1,200,000 Toman") or on request. Digits stay Latin; the Estedad ss01
 * feature renders Persian digits in fa.
 */
export default function PriceTag({
  price,
  priceType,
  currency,
  className,
  labelClassName,
}: PriceTagProps) {
  const t = useTranslations();

  if (priceType === "on_request" || price === null) {
    return <span className={className}>{t("serviceDetail.labels.onRequest")}</span>;
  }

  const value = formatNumber(price);

  if (priceType === "from") {
    return (
      <span className={className}>
        <span className={cn("text-caption font-semibold", labelClassName)}>
          {t("serviceDetail.labels.from")}
        </span>{" "}
        {value} {currency}
      </span>
    );
  }

  return (
    <span className={className}>
      {value} {currency}
    </span>
  );
}
