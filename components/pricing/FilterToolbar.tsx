"use client";

import { useTranslations } from "next-intl";
import type { TranslateFn } from "@/src/i18n/message-key";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { formatNumber } from "@/lib/services/format";
import type { PublicTreeGroup } from "@/lib/services/types";
import { cn } from "@/lib/utils";
import { bucketRange, type PriceBucket, type SortKey } from "./data";

type PriceChip = { value: PriceBucket; label: string };

function priceChips(
  bounds: { min: number; max: number },
  t: TranslateFn,
): PriceChip[] {
  const low = bucketRange(bounds, "low");
  const mid = bucketRange(bounds, "mid");
  const high = bucketRange(bounds, "high");
  return [
    {
      value: "low",
      label: t("pricing.filters.priceUnder", { price: formatNumber(low.to) }),
    },
    {
      value: "mid",
      label: t("pricing.filters.priceBetween", {
        from: formatNumber(mid.from),
        to: formatNumber(mid.to),
      }),
    },
    {
      value: "high",
      label: t("pricing.filters.priceOver", { price: formatNumber(high.from) }),
    },
  ];
}

type ChipButtonProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

/** Toggle chip used for the sort, price-bucket and group filters. */
function ChipButton({ active, children, onClick }: ChipButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-4 py-2 text-body-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        active
          ? "border-accent bg-accent text-content-contrast"
          : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive hover:text-accent",
      )}
    >
      {children}
    </button>
  );
}

type FilterToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  groups: PublicTreeGroup[];
  activeGroupSlug: string | null;
  onGroupSelect: (slug: string | null) => void;
  bounds: { min: number; max: number } | null;
  priceBucket: PriceBucket | null;
  onPriceBucketSelect: (bucket: PriceBucket | null) => void;
  activeCount: number;
  onClear: () => void;
  onOpenFilters: () => void;
};

/**
 * Search + sort + group/price filter chips for the pricing catalog.
 * Mobile shows a compact sort dropdown + a drawer trigger; desktop shows
 * the full sort select, price buckets, clear button and the group rail.
 */
export default function FilterToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  groups,
  activeGroupSlug,
  onGroupSelect,
  bounds,
  priceBucket,
  onPriceBucketSelect,
  activeCount,
  onClear,
  onOpenFilters,
}: FilterToolbarProps) {
  const t = useTranslations();
  const buckets = bounds ? priceChips(bounds, t) : [];

  return (
    <div className="space-y-4">
      {/* Search + mobile sort/filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search
            className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 text-copper"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            id="pricing-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("pricing.hero.searchPlaceholder")}
            aria-label={t("pricing.filters.label")}
            className="h-12 w-full rounded-pill border border-border-interactive bg-surface-secondary ps-12 pe-12 text-body outline-none transition-colors placeholder:text-content-tertiary focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label={t("pricing.hero.clearSearch")}
              className="absolute inset-e-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-content-tertiary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mobile sort */}
          <div className="relative lg:hidden">
            <select
              aria-label={t("pricing.filters.sort")}
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortKey)}
              className="min-h-11 w-full appearance-none rounded-pill border border-border-primary bg-surface-secondary ps-4 pe-10 text-body-sm font-semibold text-content-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <option value="recommended">{t("pricing.filters.recommended")}</option>
              <option value="priceAsc">{t("pricing.filters.priceAsc")}</option>
              <option value="priceDesc">{t("pricing.filters.priceDesc")}</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-copper"
              aria-hidden="true"
            />
          </div>

          {/* Mobile drawer trigger */}
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-body-sm font-bold text-accent transition-colors hover:border-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {t("pricing.filters.label")}
            {activeCount > 0 ? (
              <span className="inline-flex size-5 items-center justify-center rounded-pill bg-accent text-caption font-bold text-content-contrast">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Desktop sort + price buckets + clear */}
      <div className="hidden gap-6 lg:flex lg:flex-wrap lg:items-start">
        <div className="relative">
          <select
            aria-label={t("pricing.filters.sort")}
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="min-h-11 appearance-none rounded-pill border border-border-primary bg-surface-secondary ps-4 pe-10 text-body-sm font-semibold text-content-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="recommended">{t("pricing.filters.recommended")}</option>
            <option value="priceAsc">{t("pricing.filters.priceAsc")}</option>
            <option value="priceDesc">{t("pricing.filters.priceDesc")}</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-copper"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {buckets.map((bucket) => (
            <ChipButton
              key={bucket.value}
              active={priceBucket === bucket.value}
              onClick={() =>
                onPriceBucketSelect(priceBucket === bucket.value ? null : bucket.value)
              }
            >
              {bucket.label}
            </ChipButton>
          ))}
        </div>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-body-sm font-semibold text-copper-strong transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
            {t("pricing.filters.clear")}
          </button>
        ) : null}
      </div>

      {/* Desktop group rail */}
      <div className="hidden w-max max-w-full gap-2 overflow-x-auto scrollbar-hide pb-1 lg:flex">
        <ChipButton active={activeGroupSlug === null} onClick={() => onGroupSelect(null)}>
          {t("pricing.filters.allCategories")}
        </ChipButton>
        {groups.map((group) => (
          <ChipButton
            key={group.slug}
            active={activeGroupSlug === group.slug}
            onClick={() => onGroupSelect(activeGroupSlug === group.slug ? null : group.slug)}
          >
            <GroupGlyph
              name={group.icon ?? "Sparkles"}
              className={cn("size-4", activeGroupSlug === group.slug ? "text-gold" : "text-copper")}
            />
            {group.title}
          </ChipButton>
        ))}
      </div>
    </div>
  );
}
