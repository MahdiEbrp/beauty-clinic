import { useTranslations } from "next-intl";
import type { PriceType } from "@/lib/services/types";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function usePriceTypeLabel(): (type: PriceType) => string {
  const t = useTranslations();
  return (type: PriceType) => t(`servicesCatalog.priceTypes.${type}`);
}

export function formatPrice(
  price: number | null,
  priceType: PriceType,
  t: ReturnType<typeof useTranslations>,
  format: (value: number) => string,
): string {
  if (priceType === "on_request" || price === null) {
    return t("servicesCatalog.onRequest");
  }
  const prefix = priceType === "from" ? `${t("servicesCatalog.from")} ` : "";
  return `${prefix}${format(price)} ${t("servicesCatalog.currency")}`;
}

export function priceClass(type: PriceType): string {
  switch (type) {
    case "on_request":
      return "bg-surface-tertiary text-content-secondary border-border-primary";
    case "from":
      return "bg-copper/10 text-copper-strong border-copper/30";
    default:
      return "bg-success/10 text-success border-success/30";
  }
}

export const statusClass: Record<"active" | "inactive", string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
};
