"use client";

import { useTranslations } from "next-intl";
import { Search, X, Loader2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_KEYS, type RoleFilter, type StatusFilter } from "./types";
import { useRoleLabel } from "./helpers";
import { useUsers } from "./users-context";

type StatusOption = { value: StatusFilter; labelKey: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", labelKey: "users.statusAll" },
  { value: "active", labelKey: "users.statuses.active" },
  { value: "inactive", labelKey: "users.statuses.inactive" },
  { value: "banned", labelKey: "users.statuses.banned" },
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
      <DropdownMenuContent align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersFilters() {
  const t = useTranslations();
  const roleLabel = useRoleLabel();
  const {
    search,
    setSearch,
    status,
    setStatus,
    role,
    setRole,
    setPage,
    isLoading,
    setSelectedIds,
    setSelectionScope,
  } = useUsers();

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionScope("page");
  };

  const setStatusFilter = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
    clearSelection();
  };

  const setRoleFilter = (value: RoleFilter) => {
    setRole(value);
    setPage(1);
    clearSelection();
  };

  const hasActiveFilters = status !== "all" || role !== "all" || Boolean(search);

  const statusLabel =
    status === "all" ? t("users.statusAll") : t(`users.statuses.${status}`);
  const roleFilterLabel =
    role === "all" ? t("users.roleAll") : roleLabel(role);

  return (
    <section
      aria-label={t("users.filterLabel")}
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
          placeholder={t("users.searchPlaceholder")}
          aria-label={t("users.search")}
          className="h-9 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-9 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        {isLoading && (
          <Loader2
            className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-copper"
            aria-label={t("users.loading")}
          />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill
          label={`${t("users.status")}: ${statusLabel}`}
          active={status !== "all"}
        >
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setStatusFilter(option.value)}
              className="justify-between gap-3"
            >
              <span>{t(option.labelKey)}</span>
              {status === option.value && (
                <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
        </FilterPill>
        <FilterPill
          label={`${t("users.role")}: ${roleFilterLabel}`}
          active={role !== "all"}
        >
          <DropdownMenuItem onSelect={() => setRoleFilter("all")} className="justify-between gap-3">
            <span>{t("users.roleAll")}</span>
            {role === "all" && (
              <Check className="size-4 shrink-0 text-copper" strokeWidth={2.5} aria-hidden="true" />
            )}
          </DropdownMenuItem>
          {ROLE_KEYS.map((key) => (
            <DropdownMenuItem
              key={key}
              onSelect={() => setRoleFilter(key)}
              className="justify-between gap-3"
            >
              <span>{roleLabel(key)}</span>
              {role === key && (
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
              setRole("all");
              setPage(1);
              clearSelection();
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-primary bg-surface-tertiary px-3.5 py-2 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {t("users.clearFilters")}
          </button>
        )}
      </div>
    </section>
  );
}
