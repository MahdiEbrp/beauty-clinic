"use client";

import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type EmailManagementFilterOption = {
  value: string;
  label: string;
};

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

export function EmailManagementFilters({
  search,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  isLoading,
  loadingLabel,
  status,
  onStatusChange,
  statusLabel,
  statusOptions,
  clearLabel,
  onClear,
  extraFilters,
  hasExtraFilters = false,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  isLoading: boolean;
  loadingLabel: string;
  status: string;
  onStatusChange: (value: string) => void;
  statusLabel: string;
  statusOptions: EmailManagementFilterOption[];
  clearLabel: string;
  onClear: () => void;
  extraFilters?: React.ReactNode;
  hasExtraFilters?: boolean;
}) {
  const hasActiveFilters = Boolean(search) || status !== "all" || hasExtraFilters;

  return (
    <section
      aria-label={searchLabel}
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
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="h-9 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-9 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        {isLoading && (
          <Loader2
            className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-copper"
            aria-label={loadingLabel}
          />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        <FilterPill
          label={`${statusLabel}: ${
            statusOptions.find((option) => option.value === status)?.label ??
            statusOptions[0]?.label
          }`}
          active={status !== "all"}
        >
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onStatusChange(option.value)}
              className="justify-between gap-3"
            >
              <span>{option.label}</span>
              {status === option.value && (
                <Check
                  className="size-4 shrink-0 text-copper"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              )}
            </DropdownMenuItem>
          ))}
        </FilterPill>
        {extraFilters}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-primary bg-surface-tertiary px-3.5 py-2 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {clearLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export function EmailManagementFilterPill({
  label,
  active,
  value,
  options,
  onChange,
}: {
  label: string;
  active: boolean;
  value: string;
  options: EmailManagementFilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <FilterPill label={`${label}: ${options.find((option) => option.value === value)?.label ?? options[0]?.label}`} active={active}>
      {options.map((option) => (
        <DropdownMenuItem
          key={option.value}
          onSelect={() => onChange(option.value)}
          className="justify-between gap-3"
        >
          <span>{option.label}</span>
          {value === option.value && (
            <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
          )}
        </DropdownMenuItem>
      ))}
    </FilterPill>
  );
}