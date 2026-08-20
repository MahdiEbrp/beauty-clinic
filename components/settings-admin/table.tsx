"use client";

import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2, MoreVertical, Pencil, Power, PowerOff, RefreshCw, Settings as SettingsIcon, Trash2 } from "lucide-react";
import type { AdminSetting } from "@/lib/settings/admin";
import { previewValue, statusClass, statusOf } from "./helpers";
import { useSettings } from "./settings-context";
import { SelectionCheckbox } from "@/components/services/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TypeBadge({ type }: { type: string | null }) {
  const t = useTranslations();
  return (
    <span className="inline-flex items-center rounded-pill border border-border-primary bg-surface-tertiary px-2 py-0.5 text-dash-caption font-bold text-content-secondary">
      {type ? t(`settingsAdmin.types.${type}` as never) : "—"}
    </span>
  );
}

export function SettingValue({ setting }: { setting: AdminSetting }) {
  const t = useTranslations();
  const locale = useLocale() === "fa" ? "fa" : "en";
  const value = previewValue(setting, locale);
  const isLocalized = setting.type === "localized";
  return (
    <div className="min-w-0">
      <p dir={isLocalized ? undefined : "ltr"} className="max-w-xs truncate text-start text-dash-body-sm text-content-primary">
        {value}
      </p>
      {isLocalized && (
        <p className="mt-0.5 text-dash-caption font-bold text-copper-strong">{t("settingsAdmin.localized")}</p>
      )}
    </div>
  );
}

export function StatusBadge({ setting }: { setting: AdminSetting }) {
  const t = useTranslations();
  const state = statusOf(setting);
  return (
    <span className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${statusClass[state]}`}>
      {t(`settingsAdmin.statuses.${state}`)}
    </span>
  );
}

export function RowActions({ row }: { row: AdminSetting }) {
  const t = useTranslations();
  const { canWrite, canManage, isSyncing, runAction, setConfirm } = useSettings();
  const state = statusOf(row);
  const disabled = isSyncing(row.id);
  const menuButton = (key: string, labelKey: string, onClick: () => void, danger?: boolean) => (
    <DropdownMenuItem disabled={disabled} onSelect={onClick} className={danger ? "text-error focus:bg-error/10 focus:text-error" : "text-accent"}>
      {key === "edit" ? <Pencil className="size-4" /> : key === "activate" ? <Power className="size-4" /> : key === "deactivate" ? <PowerOff className="size-4" /> : <Trash2 className="size-4" />}
      <span>{t(labelKey)}</span>
    </DropdownMenuItem>
  );
  if (!canWrite && !canManage) return null;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={t("settingsAdmin.actions.menu")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canWrite && menuButton("edit", "settingsAdmin.actions.edit", () => undefined, false)}
          {canWrite &&
            (state === "active"
              ? menuButton("deactivate", "settingsAdmin.actions.deactivate", () => setConfirm({ kind: "row", action: "deactivate", setting: row }))
              : menuButton("activate", "settingsAdmin.actions.activate", () => void runAction(row, { isActive: true })))}
        </DropdownMenuGroup>
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuButton("delete", "settingsAdmin.actions.delete", () => setConfirm({ kind: "row", action: "delete", setting: row }), true)}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DesktopTable() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed, selectedIds, allVisibleSelected, selectAllRef, toggleSettingSelection, togglePageSelection, load, debouncedSearch, status, page } = useSettings();
  if (hasLoadFailed) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <Loader2 className="size-8 text-error" strokeWidth={1.75} aria-hidden="true" />
        <p className="mt-4 text-dash-body font-semibold text-content-primary">{t("settingsAdmin.errorTitle")}</p>
        <p className="mt-1 text-dash-caption text-content-secondary">{t("settingsAdmin.errorDescription")}</p>
        <button
          type="button"
          onClick={() => void load({ search: debouncedSearch, status, page })}
          className="mt-5 inline-flex items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 min-h-10 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <RefreshCw className="size-4" strokeWidth={2} aria-hidden="true" />
          {t("settingsAdmin.retry")}
        </button>
      </div>
    );
  }
  return (
    <table className="hidden w-full text-start md:table">
      <thead>
        <tr>
          <th className="w-12 px-6 py-4 text-start">
            <SelectionCheckbox ref={selectAllRef} checked={allVisibleSelected} indeterminate={!allVisibleSelected && selectedIds.length > 0} onChange={togglePageSelection} label={t("settingsAdmin.selectPage")} />
          </th>
          <th className="px-3 py-4 text-start">{t("settingsAdmin.table.key")}</th>
          <th className="px-3 py-4 text-start">{t("settingsAdmin.table.type")}</th>
          <th className="px-3 py-4 text-start">{t("settingsAdmin.table.value")}</th>
          <th className="px-3 py-4 text-center">{t("settingsAdmin.table.order")}</th>
          <th className="px-3 py-4 text-center">{t("settingsAdmin.table.status")}</th>
          <th className="w-16 px-6 py-4 text-end">
            <span className="sr-only">{t("settingsAdmin.actions.menu")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-main">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-11 animate-pulse rounded-full bg-surface-tertiary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 animate-pulse rounded-control bg-surface-tertiary" />
                      <div className="h-2.5 w-1/4 animate-pulse rounded-control bg-surface-tertiary/70" />
                    </div>
                  </div>
                </td>
              </tr>
            ))
          : data.items.length === 0
            ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-control bg-surface-tertiary">
                      <SettingsIcon className="h-8 w-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <p className="text-dash-body text-content-secondary">
                      {debouncedSearch || status !== "all" ? t("settingsAdmin.emptySearch") : t("settingsAdmin.empty")}
                    </p>
                  </div>
                </td>
              </tr>
            )
            : data.items.map((setting) => {
                const isSelected = selectedIds.includes(setting.id);
                return (
                  <tr key={setting.id} className={`transition-colors ${isSelected ? "bg-accent-subtle/40" : "hover:bg-surface-tertiary/40"}`}>
                    <td className="px-6 py-4 text-center">
                      <SelectionCheckbox checked={isSelected} onChange={() => toggleSettingSelection(setting.id)} label={t("settingsAdmin.selectRow")} />
                    </td>
                    <td className="px-3 py-4">
                      <p dir="ltr" className="truncate text-dash-body font-semibold text-accent">{setting.key}</p>
                    </td>
                    <td className="px-3 py-4"><TypeBadge type={setting.type} /></td>
                    <td className="px-3 py-4"><SettingValue setting={setting} /></td>
                    <td className="px-3 py-4 text-center"><span className="text-dash-body-sm text-content-secondary">{setting.displayOrder}</span></td>
                    <td className="px-3 py-4 text-center"><StatusBadge setting={setting} /></td>
                    <td className="px-6 py-4 text-end"><RowActions row={setting} /></td>
                  </tr>
                );
              })}
      </tbody>
    </table>
  );
}