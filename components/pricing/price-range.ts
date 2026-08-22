import type { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/services/format";
import type { CategoryCardData } from "./data";

/**
 * Build the human-readable price label for a whole category card.
 *
 * Mirrors the catalog price badge: a concrete single price (e.g. "1,200,000 Toman"),
 * a "from" price, a range ("1,200,000 – 2,400,000 Toman"), or "Price on request".
 * Shared by `CategoryCard` and `CategoryDetailDialog` so the label stays identical.
 */
export function categoryPriceRange(
	card: CategoryCardData,
	t: ReturnType<typeof useTranslations>,
	currency: string,
): string {
	const { minPrice, maxPrice } = card;
	if (minPrice === null || maxPrice === null) {
		return t("serviceDetail.labels.onRequest");
	}
	const hasFrom = card.services.some((service) => service.priceType === "from");
	const value = `${formatNumber(minPrice)} ${currency}`;
	if (minPrice === maxPrice) {
		return hasFrom ? `${t("pricing.card.from")} ${value}` : value;
	}
	return `${formatNumber(minPrice)} – ${formatNumber(maxPrice)} ${currency}`;
}
