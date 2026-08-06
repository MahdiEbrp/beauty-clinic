"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ROLE_KEYS, type BulkAction } from "./types";
import { useRoleLabel } from "./helpers";
import { useUsers } from "./users-context";

export function UsersSelectionBar() {
  const t = useTranslations();
  const roleLabel = useRoleLabel();
  const {
    data,
    selectionScope,
    selectedIds,
    bulkAction,
    setBulkAction,
    bulkRole,
    setBulkRole,
    bulkDangerous,
    runBulkAction,
    clearSelection,
    busyId,
  } = useUsers();

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border-primary bg-accent-subtle/75 px-4 py-3 md:px-6">
      <span className="text-dash-body-sm font-bold text-accent">
        {selectionScope === "filtered"
          ? t("users.bulk.selectedFiltered", { count: data.total })
          : t("users.bulk.selected", { count: selectedIds.length })}
      </span>
      <select
        value={bulkAction}
        onChange={(event) => setBulkAction(event.target.value as BulkAction)}
        className={`min-h-10 rounded-control border bg-form-input-bg px-3 text-dash-caption font-bold outline-none focus-visible:border-copper ${bulkDangerous ? "border-error/50 text-error" : "border-form-input-border text-accent"}`}
      >
        <option value="activate">{t("users.bulk.activate")}</option>
        <option value="deactivate">{t("users.bulk.deactivate")}</option>
        <option value="ban">{t("users.bulk.ban")}</option>
        <option value="unban">{t("users.bulk.unban")}</option>
        <option value="change-role">{t("users.bulk.changeRole")}</option>
        <option value="reset-password">{t("users.bulk.resetPassword")}</option>
        <option value="delete">{t("users.bulk.delete")}</option>
      </select>
      {bulkAction === "change-role" && (
        <select
          value={bulkRole}
          onChange={(event) => setBulkRole(event.target.value)}
          className="min-h-10 rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-caption font-bold text-accent outline-none focus-visible:border-copper"
        >
          <option value="">{t("users.form.rolePlaceholder")}</option>
          {ROLE_KEYS.map((key) => (
            <option key={key} value={key}>
              {roleLabel(key)}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={runBulkAction}
        disabled={busyId === "bulk"}
        className={`inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-dash-caption font-bold disabled:opacity-50 ${bulkDangerous ? "bg-error text-content-contrast hover:bg-error/90" : "border border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"}`}
      >
        {busyId === "bulk" && <Loader2 className="size-4 animate-spin" />}
        {t("users.bulk.apply")}
      </button>
      <button
        type="button"
        onClick={clearSelection}
        className="min-h-10 rounded-pill px-3 text-dash-caption font-bold text-content-secondary hover:bg-surface-tertiary"
      >
        {t("users.bulk.clear")}
      </button>
    </div>
  );
}

export function UsersSelectFilteredRow() {
  const t = useTranslations();
  const {
    data,
    selectedIds,
    selectionScope,
    selectedVisibleCount,
    visibleIds,
    selectFilteredResults,
  } = useUsers();

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
      <span>{t("users.bulk.pageSelected")}</span>
      <button
        type="button"
        onClick={selectFilteredResults}
        className="font-bold text-copper-strong hover:underline"
      >
        {t("users.bulk.selectFiltered", { count: data.total })}
      </button>
    </div>
  );
}
