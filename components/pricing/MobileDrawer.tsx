"use client";

import { useTranslations } from "next-intl";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatNumber } from "@/lib/services/format";
import type { PublicTreeGroup } from "@/lib/services/types";
import { cn } from "@/lib/utils";
import { bucketRange, type CatalogFilters } from "./data";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: CatalogFilters;
  groups: PublicTreeGroup[];
  bounds: { min: number; max: number } | null;
  onChange: (next: Partial<CatalogFilters>) => void;
  onClear: () => void;
};

function CheckRow({
  checked,
  icon,
  label,
  onToggle,
}: {
  checked: boolean;
  icon?: React.ReactNode;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-control border px-3 py-2.5 transition-colors",
        checked ? "border-accent bg-accent-subtle" : "border-border-primary bg-surface-secondary",
      )}
    >
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span
        className={cn(
          "flex-1 text-body-sm font-semibold leading-tight",
          checked ? "text-accent" : "text-content-primary",
        )}
      >
        {label}
      </span>
      <Checkbox checked={checked} onCheckedChange={onToggle} />
    </Label>
  );
}

/** Responsive end-side filter sheet using shadcn Sheet + Checkbox rows. */
export default function MobileDrawer({
  open,
  onClose,
  filters,
  groups,
  bounds,
  onChange,
  onClear,
}: MobileDrawerProps) {
  const t = useTranslations();

  const buckets = bounds
    ? [
        { value: "low" as const, label: t("pricing.filters.priceUnder", { price: formatNumber(bucketRange(bounds, "low").to) }) },
        { value: "mid" as const, label: t("pricing.filters.priceBetween", { from: formatNumber(bucketRange(bounds, "mid").from), to: formatNumber(bucketRange(bounds, "mid").to) }) },
        { value: "high" as const, label: t("pricing.filters.priceOver", { price: formatNumber(bucketRange(bounds, "high").from) }) },
      ]
    : [];

  const groupIcon = (group: PublicTreeGroup) => (
    <GroupGlyph
      name={group.icon ?? "Sparkles"}
      className={cn("size-5", filters.groupSlug === group.slug ? "text-copper-strong" : "text-copper")}
    />
  );

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent closeLabel={t("nav.closeMenu")}>
        <SheetHeader className="border-b border-border-primary px-5 py-4 text-start">
          <SheetTitle>{t("pricing.drawer.title")}</SheetTitle>
          <SheetDescription className="sr-only">{t("pricing.filters.label")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <p className="mb-3 text-caption font-bold uppercase tracking-wider text-content-tertiary">
              {t("pricing.drawer.categories")}
            </p>
            <div className="grid gap-2">
              <CheckRow
                checked={filters.groupSlug === null}
                onToggle={() => onChange({ groupSlug: null })}
                label={t("pricing.filters.allCategories")}
              />
              {groups.map((group) => (
                <CheckRow
                  key={group.slug}
                  checked={filters.groupSlug === group.slug}
                  onToggle={() =>
                    onChange({ groupSlug: filters.groupSlug === group.slug ? null : group.slug })
                  }
                  icon={groupIcon(group)}
                  label={group.title}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-caption font-bold uppercase tracking-wider text-content-tertiary">
              {t("pricing.filters.price")}
            </p>
            <div className="grid gap-2">
              {buckets.map((bucket) => (
                <CheckRow
                  key={bucket.value}
                  checked={filters.priceBucket === bucket.value}
                  onToggle={() =>
                    onChange({ priceBucket: filters.priceBucket === bucket.value ? null : bucket.value })
                  }
                  label={bucket.label}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-caption font-bold uppercase tracking-wider text-content-tertiary">
              {t("pricing.drawer.sort")}
            </p>
            <div className="grid gap-2">
              <CheckRow
                checked={filters.sort === "recommended"}
                onToggle={() => onChange({ sort: "recommended" })}
                label={t("pricing.filters.recommended")}
              />
              <CheckRow
                checked={filters.sort === "priceAsc"}
                onToggle={() => onChange({ sort: "priceAsc" })}
                label={t("pricing.filters.priceAsc")}
              />
              <CheckRow
                checked={filters.sort === "priceDesc"}
                onToggle={() => onChange({ sort: "priceDesc" })}
                label={t("pricing.filters.priceDesc")}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2 border-t border-border-primary p-4 sm:flex-row">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary px-5 text-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("pricing.filters.clear")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-pill bg-accent px-5 text-body-sm font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("pricing.drawer.apply")}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
