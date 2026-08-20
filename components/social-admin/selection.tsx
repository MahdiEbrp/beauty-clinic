"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useSocialLinks } from "./social-context";

export function SelectionBar() {
  const t = useTranslations();
  const { data, selectionScope, selectedIds, bulkAction, setBulkAction, runBulkAction, clearSelection, busyId, bulkDangerous } = useSocialLinks();
  if (selectedIds.length === 0) return null;
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border-primary bg-accent-subtle/75 px-4 py-3 md:px-6">
      <span className="text-dash-body-sm font-bold text-accent">
        {selectionScope === "filtered"
          ? t("socialAdmin.bulk.selectedFiltered", { count: data.total })
          : t("socialAdmin.bulk.selected", { count: selectedIds.length })}
      </span>
      <select
        value={bulkAction}
        onChange={(event) => setBulkAction(event.target.value as "activate" | "deactivate" | "delete")}
        className={`min-h-10 rounded-control border bg-form-input-bg px-3 text-dash-caption font-bold outline-none focus-visible:border-copper ${bulkDangerous ? "border-error/50 text-error" : "border-form-input-border text-accent"}`}
      >
        <option value="activate">{t("socialAdmin.bulk.activate")}</option>
        <option value="deactivate">{t("socialAdmin.bulk.deactivate")}</option>
        <option value="delete">{t("socialAdmin.bulk.delete")}</option>
      </select>
      <button
        type="button"
        onClick={runBulkAction}
        disabled={busyId === "bulk"}
        className={`inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-dash-caption font-bold disabled:opacity-50 ${bulkDangerous ? "bg-error text-content-contrast hover:bg-error/90" : "border border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"}`}
      >
        {busyId === "bulk" && <Loader2 className="size-4 animate-spin" />}
        {t("socialAdmin.bulk.apply")}
      </button>
      <button type="button" onClick={clearSelection} className="min-h-10 rounded-pill px-3 text-dash-caption font-bold text-content-secondary hover:bg-surface-tertiary">
        {t("socialAdmin.bulk.clear")}
      </button>
    </div>
  );
}

export function SelectFilteredRow() {
  const t = useTranslations();
  const { data, selectedIds, selectionScope, selectedVisibleCount, visibleIds, selectAllFiltered } = useSocialLinks();
  if (selectedIds.length === 0 || selectionScope !== "page" || data.total <= data.items.length || selectedVisibleCount !== visibleIds.length) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-primary px-4 py-2 text-dash-caption text-content-secondary md:px-6">
      <span>{t("socialAdmin.bulk.pageSelected")}</span>
      <button type="button" onClick={selectAllFiltered} className="font-bold text-copper-strong hover:underline">
        {t("socialAdmin.bulk.selectFiltered", { count: data.total })}
      </button>
    </div>
  );
}