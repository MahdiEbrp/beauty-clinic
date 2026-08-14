"use client";

import { useTranslations } from "next-intl";
import { Search, X, Loader2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeaturedFilter, ServiceStatusFilter } from "./types";
import { useServices } from "./services-context";

type StatusOption = { value: ServiceStatusFilter; labelKey: string };
const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", labelKey: "serviceServices.statusAll" },
  { value: "active", labelKey: "serviceServices.statuses.active" },
  { value: "inactive", labelKey: "serviceServices.statuses.inactive" },
];

type FeaturedOption = { value: FeaturedFilter; labelKey: string };
const FEATURED_OPTIONS: FeaturedOption[] = [
  { value: "all", labelKey: "serviceServices.featuredAll" },
  { value: "yes", labelKey: "serviceServices.featuredYes" },
  { value: "no", labelKey: "serviceServices.featuredNo" },
];

function FilterPill({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
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
      <DropdownMenuContent align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ServicesFilters() {
  const t = useTranslations();
  const {
    search,
    setSearch,
    status,
    setStatus,
    featured,
    setFeatured,
    setPage,
    isLoading,
    setSelectedIds,
    setSelectionScope,
  } = useServices();

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionScope("page");
  };
  const setStatusFilter = (value: ServiceStatusFilter) => {
    setStatus(value);
    setPage(1);
    clearSelection();
  };
  const setFeaturedFilter = (value: FeaturedFilter) => {
    setFeatured(value);
    setPage(1);
    clearSelection();
  };

  const hasActiveFilters = status !== "all" || featured !== "all" || Boolean(search);
  const statusLabel =
    status === "all"
      ? t("serviceServices.statusAll")
      : t(`serviceServices.statuses.${status}`);
  const featuredLabel =
    featured === "all"
      ? t("serviceServices.featuredAll")
      : t(`serviceServices.featured${featured === "yes" ? "Yes" : "No"}`);

  return (
    <section aria-label={t("serviceServices.search")} className="rounded-card border border-border-primary bg-surface-secondary/60 p-2.5 sm:p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            clearSelection();
          }}
          placeholder={t("serviceServices.searchPlaceholder")}
          aria-label={t("serviceServices.search")}
          className="h-9 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-9 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        {isLoading && <Loader2 className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-copper" strokeWidth={2} aria-label={t("serviceServices.loading")} />}
      </div>
      <div className="mt-2 flex items-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scroll-snap-type-x:mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill label={`${t("serviceServices.status")}: ${statusLabel}`} active={status !== "all"}>
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => setStatusFilter(option.value)} className="justify-between gap-3">
              <span>{t(option.labelKey)}</span>
              {status === option.value && <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </FilterPill>
        <FilterPill label={`${t("serviceServices.featured")}: ${featuredLabel}`} active={featured !== "all"}>
          {FEATURED_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => setFeaturedFilter(option.value)} className="justify-between gap-3">
              <span>{t(option.labelKey)}</span>
              {featured === option.value && <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />}
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
              setPage(1);
              clearSelection();
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-primary bg-surface-tertiary px-3.5 py-2 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {t("serviceServices.clearFilters")}
          </button>
        )}
      </div>
    </section>
  );
}
