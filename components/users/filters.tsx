"use client";

import { useTranslations } from "next-intl";
import { Search, X, Loader2, ChevronDown } from "lucide-react";
import { ROLE_KEYS, type RoleFilter, type StatusFilter } from "./types";
import { useRoleLabel } from "./helpers";
import { useUsers } from "./users-context";

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

  return (
    <section
      aria-labelledby="user-filters-heading"
      className="rounded-card border border-border-primary bg-surface-secondary/60 p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="user-filters-heading"
          className="text-dash-body-sm font-bold text-accent"
        >
          {t("users.filterLabel")}
        </h2>
        {isLoading && (
          <Loader2
            className="size-4 animate-spin text-copper"
            aria-label={t("users.loading")}
          />
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-end md:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
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
            className="w-full bg-form-input-bg border border-form-input-border rounded-control py-3 ps-12 pe-4 text-dash-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>
        <label className="grid gap-1 text-dash-caption font-bold text-content-secondary">
          <span className="whitespace-nowrap">{t("users.status")}</span>
          <span className="relative block w-full">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StatusFilter);
                setPage(1);
                clearSelection();
              }}
              className="min-h-11 w-full appearance-none rounded-control border border-form-input-border bg-form-input-bg py-2.5 ps-4 pe-10 text-dash-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <option value="all">{t("users.statusAll")}</option>
              <option value="active">{t("users.statusActive")}</option>
              <option value="inactive">{t("users.statusInactive")}</option>
              <option value="banned">{t("users.statusBanned")}</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary"
              aria-hidden="true"
            />
          </span>
        </label>
        <label className="grid gap-1 text-dash-caption font-bold text-content-secondary">
          <span className="whitespace-nowrap">{t("users.role")}</span>
          <span className="relative block w-full">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as RoleFilter);
                setPage(1);
                clearSelection();
              }}
              className="min-h-11 w-full appearance-none rounded-control border border-form-input-border bg-form-input-bg py-2.5 ps-4 pe-10 text-dash-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <option value="all">{t("users.roleAll")}</option>
              {ROLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {roleLabel(key)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary"
              aria-hidden="true"
            />
          </span>
        </label>
        {(status !== "all" || role !== "all" || search) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setRole("all");
              setPage(1);
              clearSelection();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" /> {t("users.clearFilters")}
          </button>
        )}
      </div>
    </section>
  );
}
