"use client";

import { useTranslations, useLocale } from "next-intl";
import type { MessageKey } from "@/src/i18n/message-key";
import { useRouter } from "@/src/i18n/navigation";
import { MoreVertical, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import type { AdminSetting } from "@/lib/settings/admin";
import { previewValue, statusClass, statusOf } from "./helpers";
import { useSettings } from "./settings-context";
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
      <p dir={isLocalized ? (locale === "fa" ? "rtl" : "ltr") : "ltr"} className="max-w-xs truncate text-start text-dash-body-sm text-content-primary">
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
  const router = useRouter();
  const { canWrite, canManage, isSyncing, runAction, setConfirm } = useSettings();
  const state = statusOf(row);
  const disabled = isSyncing(row.id);
  const menuButton = (key: string, labelKey: MessageKey, onClick: () => void, danger?: boolean) => (
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
          {canWrite && menuButton("edit", "settingsAdmin.actions.edit", () => void router.push(`/dashboard/settings/${row.id}/edit`), false)}
          {canWrite &&
            (state === "active"
              ? menuButton("deactivate", "settingsAdmin.actions.deactivate", () => setConfirm({ action: "deactivate", setting: row }))
              : menuButton("activate", "settingsAdmin.actions.activate", () => void runAction(row, { isActive: true })))}
        </DropdownMenuGroup>
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuButton("delete", "settingsAdmin.actions.delete", () => setConfirm({ action: "delete", setting: row }), true)}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}