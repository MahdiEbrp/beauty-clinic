"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useAdminListContext } from "./context";

export function AdminListSelectionBar<T extends { id: string }>() {
  const t = useTranslations();
  const ctx = useAdminListContext<T>();
  const { config, data, selectionScope, selectedIds, bulkAction, setBulkAction, bulkDangerous, runBulkAction, clearSelection, busyId } = ctx;
  if (selectedIds.length === 0) return null;
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border-primary bg-accent-subtle/75 px-4 py-3 md:px-6">
      <span className="text-dash-body-sm font-bold text-accent">
        {selectionScope === "filtered"
          ? t(`${config.namespace}.bulk.selectedFiltered`, { count: data.total })
          : t(`${config.namespace}.bulk.selected`, { count: selectedIds.length })}
      </span>
      <select
        value={bulkAction}
                onChange={(event) => setBulkAction(event.target.value)}
        className={`min-h-10 rounded-control border bg-form-input-bg px-3 text-dash-caption font-bold outline-none focus-visible:border-copper ${bulkDangerous ? "border-error/50 text-error" : "border-form-input-border text-accent"}`}
      >
        {config.bulkActions.map((action) => (
          <option key={action.key} value={action.key}>
            {t(action.labelKey)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={runBulkAction}
        disabled={busyId === "bulk"}
        className={`inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-dash-caption font-bold disabled:opacity-50 ${bulkDangerous ? "bg-error text-content-contrast hover:bg-error/90" : "border border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"}`}
      >
        {busyId === "bulk" && <Loader2 className="size-4 animate-spin" />}
        {t(`${config.namespace}.bulk.apply`)}
      </button>
      <button
        type="button"
        onClick={clearSelection}
        className="min-h-10 rounded-pill px-3 text-dash-caption font-bold text-content-secondary hover:bg-surface-tertiary"
      >
        {t(`${config.namespace}.bulk.clear`)}
      </button>
    </div>
  );
}

export function AdminListSelectFilteredRow<T extends { id: string }>() {
  const t = useTranslations();
  const ctx = useAdminListContext<T>();
  const { config, data, selectedIds, selectionScope, selectedVisibleCount, visibleIds, selectAllFiltered } = ctx;
  if (
    selectedIds.length === 0 ||
    selectionScope !== "page" ||
    data.total <= data.items.length ||
    selectedVisibleCount !== visibleIds.length
  ) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-primary px-4 py-2 text-dash-caption text-content-secondary md:px-6">
      <span>{t(`${config.namespace}.bulk.pageSelected`)}</span>
      <button
        type="button"
        onClick={selectAllFiltered}
        className="font-bold text-copper-strong hover:underline"
      >
        {t(`${config.namespace}.bulk.selectFiltered`, { count: data.total })}
      </button>
    </div>
  );
}
