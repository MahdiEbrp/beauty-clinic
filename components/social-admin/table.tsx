"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2, MoreVertical, Pencil, Power, PowerOff, RefreshCw, Trash2 } from "lucide-react";
import type { AdminSocialLink } from "@/lib/social/admin";
import { statusClass, statusOf } from "./helpers";
import { useSocialLinks } from "./social-context";
import { SelectionCheckbox } from "@/components/services/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LinkGlyph({ link }: { link: AdminSocialLink }) {
  const t = useTranslations();
  return (
    <span className="relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-primary bg-accent-subtle/60 text-accent">
      {link.imageUrl ? (
        <img
          src={link.imageUrl}
          alt=""
          sizes="48px"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-dash-caption font-bold">{t("socialAdmin.glyph")}</span>
      )}
    </span>
  );
}

export function StatusBadge({ link }: { link: AdminSocialLink }) {
  const t = useTranslations();
  const state = statusOf(link);
  return (
    <span className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${statusClass[state]}`}>
      {t(`socialAdmin.statuses.${state}`)}
    </span>
  );
}

export function RowActions({ row }: { row: AdminSocialLink }) {
  const t = useTranslations();
  const { canWrite, canManage, isSyncing, runAction, setConfirm } = useSocialLinks();
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
          aria-label={t("socialAdmin.actions.menu")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canWrite && menuButton("edit", "socialAdmin.actions.edit", () => undefined, false)}
          {canWrite &&
            (state === "active"
              ? menuButton("deactivate", "socialAdmin.actions.deactivate", () => setConfirm({ kind: "row", action: "deactivate", link: row }))
              : menuButton("activate", "socialAdmin.actions.activate", () => void runAction(row, { isActive: true })))}
        </DropdownMenuGroup>
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuButton("delete", "socialAdmin.actions.delete", () => setConfirm({ kind: "row", action: "delete", link: row }), true)}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DesktopTable() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed, selectedIds, allVisibleSelected, selectAllRef, toggleLinkSelection, togglePageSelection, load, debouncedSearch, status, page } = useSocialLinks();
  if (hasLoadFailed) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <Loader2 className="size-8 text-error" strokeWidth={1.75} aria-hidden="true" />
        <p className="mt-4 text-dash-body font-semibold text-content-primary">{t("socialAdmin.errorTitle")}</p>
        <p className="mt-1 text-dash-caption text-content-secondary">{t("socialAdmin.errorDescription")}</p>
        <button
          type="button"
          onClick={() => void load({ search: debouncedSearch, status, page })}
          className="mt-5 inline-flex items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 min-h-10 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <RefreshCw className="size-4" strokeWidth={2} aria-hidden="true" />
          {t("socialAdmin.retry")}
        </button>
      </div>
    );
  }
  return (
    <table className="hidden w-full text-start md:table">
      <thead>
        <tr>
          <th className="w-12 px-6 py-4 text-start">
            <SelectionCheckbox ref={selectAllRef} checked={allVisibleSelected} indeterminate={!allVisibleSelected && selectedIds.length > 0} onChange={togglePageSelection} label={t("socialAdmin.selectPage")} />
          </th>
          <th className="px-3 py-4 text-start">{t("socialAdmin.table.label")}</th>
          <th className="px-3 py-4 text-start">{t("socialAdmin.table.url")}</th>
          <th className="px-3 py-4 text-center">{t("socialAdmin.table.order")}</th>
          <th className="px-3 py-4 text-center">{t("socialAdmin.table.status")}</th>
          <th className="w-16 px-6 py-4 text-end">
            <span className="sr-only">{t("socialAdmin.actions.menu")}</span>
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
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <p className="text-dash-body text-content-secondary">
                      {debouncedSearch || status !== "all" ? t("socialAdmin.emptySearch") : t("socialAdmin.empty")}
                    </p>
                  </div>
                </td>
              </tr>
            )
            : data.items.map((link) => {
                const isSelected = selectedIds.includes(link.id);
                return (
                  <tr key={link.id} className={`transition-colors ${isSelected ? "bg-accent-subtle/40" : "hover:bg-surface-tertiary/40"}`}>
                    <td className="px-6 py-4 text-center">
                      <SelectionCheckbox checked={isSelected} onChange={() => toggleLinkSelection(link.id)} label={t("socialAdmin.selectRow")} />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <LinkGlyph link={link} />
                        <div className="min-w-0">
                          <p className="truncate text-dash-body font-semibold text-accent">{link.labelFa}</p>
                          <p dir="ltr" className="truncate text-dash-caption text-content-tertiary">{link.labelEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p dir="ltr" className="max-w-xs truncate text-dash-body-sm text-content-secondary">{link.url}</p>
                    </td>
                    <td className="px-3 py-4 text-center"><span className="text-dash-body-sm text-content-secondary">{link.displayOrder}</span></td>
                    <td className="px-3 py-4 text-center"><StatusBadge link={link} /></td>
                    <td className="px-6 py-4 text-end"><RowActions row={link} /></td>
                  </tr>
                );
              })}
      </tbody>
    </table>
  );
}