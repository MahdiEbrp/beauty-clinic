"use client";

import { useTranslations } from "next-intl";
import { Search, X, Loader2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeaturedFilter, StatusFilter } from "./types";
import { useServices } from "./services-context";

const STATUS_OPTIONS: Array<{ value: StatusFilter; labelKey: string }> = [
  { value: "all", labelKey: "statusAll" },
  { value: "active", labelKey: "statuses.active" },
  { value: "inactive", labelKey: "statuses.inactive" },
];

const FEATURED_OPTIONS: Array<{ value: FeaturedFilter; labelKey: string }> = [
  { value: "all", labelKey: "featuredAll" },
  { value: "yes", labelKey: "featured.yes" },
  { value: "no", labelKey: "featured.no" },
];

function FilterPill({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-2 text-dash-body-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            active
              ? "border-accent bg-accent text-content-contrast"
              : "border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"
          }`}
        >
          <span>{label}</span>
          <ChevronDown className="size-3.5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ServiceFilters() {
  const t = useTranslations();
  const {
    search,
    setSearch,
    status,
    setStatus,
    featured,
    setFeatured,
    categoryId,
    setCategoryId,
    summary,
    setPage,
    isLoading,
  } = useServices();

  const setStatusFilter = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const setFeaturedFilter = (value: FeaturedFilter) => {
    setFeatured(value);
    setPage(1);
  };

  const setCategoryFilter = (value: string) => {
    setCategoryId(value);
    setPage(1);
  };

  const hasActiveFilters =
    status !== "all" ||
    featured !== "all" ||
    Boolean(categoryId) ||
    Boolean(search);

  const statusLabel =
    status === "all" ? t("servicesCatalog.statusAll") : t(`servicesCatalog.statuses.${status}`);
  const featuredLabel =
    featured === "all"
      ? t("servicesCatalog.featuredAll")
      : t(`servicesCatalog.featured.${featured}`);
  const categoryLabel = categoryId
    ? (summary.categories.find((c) => c.id === categoryId)?.name ?? categoryId)
    : t("servicesCatalog.categoryAll");

  return (
    <section
      aria-label={t("servicesCatalog.filterLabel")}
      className="rounded-card border border-border-primary bg-surface-secondary/60 p-2.5 sm:p-3"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary"
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t("servicesCatalog.searchPlaceholder")}
          aria-label={t("servicesCatalog.search")}
          className="h-9 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-9 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        {isLoading && (
          <Loader2
            className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-copper"
            aria-label={t("servicesCatalog.loading")}
          />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill
          label={`${t("servicesCatalog.status")}: ${statusLabel}`}
          active={status !== "all"}
        >
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setStatusFilter(option.value)}
              className="justify-between gap-3"
            >
              <span>{t(`servicesCatalog.${option.labelKey}`)}</span>
              {status === option.value && (
                <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
        </FilterPill>
        <FilterPill
          label={`${t("servicesCatalog.featuredLabel")}: ${featuredLabel}`}
          active={featured !== "all"}
        >
          {FEATURED_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setFeaturedFilter(option.value)}
              className="justify-between gap-3"
            >
              <span>{t(`servicesCatalog.${option.labelKey}`)}</span>
              {featured === option.value && (
                <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
        </FilterPill>
        <FilterPill
          label={`${t("servicesCatalog.category")}: ${categoryLabel}`}
          active={Boolean(categoryId)}
        >
          <DropdownMenuItem
            onSelect={() => setCategoryFilter("")}
            className="justify-between gap-3"
          >
            <span>{t("servicesCatalog.categoryAll")}</span>
            {!categoryId && (
              <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
            )}
          </DropdownMenuItem>
          {summary.categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onSelect={() => setCategoryFilter(category.id)}
              className="justify-between gap-3"
            >
              <span>{category.name}</span>
              {categoryId === category.id && (
                <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
        </FilterPill>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setFeatured("all");
              setCategoryId("");
              setPage(1);
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-primary bg-surface-tertiary px-3.5 py-2 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {t("servicesCatalog.clearFilters")}
          </button>
        )}
      </div>
    </section>
  );
}
