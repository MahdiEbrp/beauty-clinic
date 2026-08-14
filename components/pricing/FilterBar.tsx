"use client";

import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNumber } from "@/lib/services/format";
import {
  bucketRange,
  type CatalogFilters,
  type PriceBucket,
  type SortKey,
} from "./data";

type SelectOption = { value: string; label: string };

type FilterBarProps = {
  filters: CatalogFilters;
  onChange: (next: Partial<CatalogFilters>) => void;
  onClear: () => void;
  categories: { slug: string; title: string }[];
  bounds: { min: number; max: number } | null;
  activeCount: number;
  resultCount: number;
};

function SelectPill({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full lg:w-auto">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full appearance-none rounded-pill border border-border-primary bg-surface-secondary ps-4 pe-10 text-body-sm font-semibold text-content-primary outline-none transition-colors hover:border-border-interactive focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-copper"
        aria-hidden="true"
      />
    </div>
  );
}

function bucketOptions(
  bounds: { min: number; max: number },
  t: ReturnType<typeof useTranslations>,
): SelectOption[] {
  const low = bucketRange(bounds, "low");
  const mid = bucketRange(bounds, "mid");
  const high = bucketRange(bounds, "high");
  return [
    { value: "low", label: t("pricing.filters.priceUnder", { price: formatNumber(low.to) }) },
    {
      value: "mid",
      label: t("pricing.filters.priceBetween", {
        from: formatNumber(mid.from),
        to: formatNumber(mid.to),
      }),
    },
    { value: "high", label: t("pricing.filters.priceOver", { price: formatNumber(high.from) }) },
  ];
}

/**
 * Category / price-range / sort controls. Inline on large screens, a dialog
 * sheet on mobile. Changes apply immediately.
 */
export default function FilterBar({
  filters,
  onChange,
  onClear,
  categories,
  bounds,
  activeCount,
  resultCount,
}: FilterBarProps) {
  const t = useTranslations();

  const categoryOptions: SelectOption[] = [
    { value: "all", label: t("pricing.filters.allCategories") },
    ...categories.map((category) => ({ value: category.slug, label: category.title })),
  ];
  const priceOptions: SelectOption[] = [
    { value: "all", label: t("pricing.filters.anyPrice") },
    ...(bounds ? bucketOptions(bounds, t) : []),
  ];
  const sortOptions: SelectOption[] = [
    { value: "recommended", label: t("pricing.filters.recommended") },
    { value: "priceAsc", label: t("pricing.filters.priceAsc") },
    { value: "priceDesc", label: t("pricing.filters.priceDesc") },
  ];

  const renderControls = (prefix: string) => (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SelectPill
        id={`${prefix}-category`}
        label={t("pricing.filters.category")}
        value={filters.categorySlug ?? "all"}
        options={categoryOptions}
        onChange={(value) =>
          onChange({ categorySlug: value === "all" ? null : value })
        }
      />
      <SelectPill
        id={`${prefix}-price`}
        label={t("pricing.filters.price")}
        value={filters.priceBucket ?? "all"}
        options={priceOptions}
        onChange={(value) =>
          onChange({ priceBucket: value === "all" ? null : (value as PriceBucket) })
        }
      />
      <SelectPill
        id={`${prefix}-sort`}
        label={t("pricing.filters.sort")}
        value={filters.sort}
        options={sortOptions}
        onChange={(value) => onChange({ sort: value as SortKey })}
      />
      {activeCount > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-pill px-3 text-body-sm font-semibold text-copper-strong transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X className="size-4" aria-hidden="true" />
          {t("pricing.filters.clear")}
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p role="status" className="text-body-sm font-semibold text-content-tertiary">
          {t("pricing.filters.results", { count: resultCount })}
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
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
          </DialogTrigger>
          <DialogContent closeLabel={t("nav.closeMenu")} className="max-w-md">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-heading-3 text-accent">
                {t("pricing.filters.label")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderControls("sheet")}
              <p className="pt-2 text-caption text-content-tertiary">
                {t("pricing.filters.results", { count: resultCount })}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 hidden lg:block">{renderControls("inline")}</div>
    </div>
  );
}