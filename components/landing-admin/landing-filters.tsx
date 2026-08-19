"use client";

import { useTranslations } from "next-intl";
import { Search, X, Loader2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StatusFilter } from "./types";
import { useLandingCollection } from "./landing-collection-context";

const STATUS_OPTIONS: StatusFilter[] = ["all", "active", "inactive"];

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
          <ChevronDown
            className="size-3.5 rtl-mirror"
            strokeWidth={2}
            aria-hidden="true"
          />
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

export function LandingCollectionFilters() {
  const t = useTranslations();
  const {
    search,
    setSearch,
    status,
    setStatus,
    setPage,
    isLoading,
    setSelectedIds,
    setSelectionScope,
  } = useLandingCollection();

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionScope("page");
  };

  const setStatusFilter = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
    clearSelection();
  };

  const hasActiveFilters = status !== "all" || Boolean(search);

  const statusLabel =
    status === "all"
      ? t("landingAdmin.statusAll")
      : t(`landingAdmin.statuses.${status}`);

  return (
    <section
      aria-label={t("landingAdmin.search")}
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
            clearSelection();
          }}
          placeholder={t("landingAdmin.searchPlaceholder")}
          aria-label={t("landingAdmin.search")}
          className="h-9 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-9 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        {isLoading && (
          <Loader2
            className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-copper"
            aria-label={t("landingAdmin.loading")}
          />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        <FilterPill
          label={`${t("landingAdmin.status")}: ${statusLabel}`}
          active={status !== "all"}
        >
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={() => setStatusFilter(option)}
              className="justify-between gap-3"
            >
              <span>{t(`landingAdmin.statuses.${option}`)}</span>
              {status === option && (
                <Check
                  className="size-4 shrink-0 text-copper"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
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
              setPage(1);
              clearSelection();
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-primary bg-surface-tertiary px-3.5 py-2 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {t("landingAdmin.clearFilters")}
          </button>
        )}
      </div>
    </section>
  );
}
