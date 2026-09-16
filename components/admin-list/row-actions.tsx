"use client";

import { useTranslations } from "next-intl";
import { asTranslate, type TranslateFn } from "@/src/i18n/message-key";
import { Power, PowerOff, Trash2, Pencil, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminListContext } from "./context";
import type { RowActionItem } from "./types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  edit: Pencil,
  activate: Power,
  deactivate: PowerOff,
  confirm: CheckCircle,
  cancel: XCircle,
  delete: Trash2,
};

export function AdminListRowActions<T extends { id: string }>({ row }: { row: T }) {
  const t = asTranslate(useTranslations());
  const ctx = useAdminListContext<T>();
  const { config, isSyncing } = ctx;
  const disabled = isSyncing(row.id);
  const buttons = config.rowActionButtons(row, { isSyncing, setConfirm: ctx.setConfirm });

  if (buttons.length === 0) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={t(`${config.namespace}.actions.menu`)}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {buttons.filter((b) => b.key === "edit").length > 0 && (
          <DropdownMenuGroup>
            {buttons.filter((b) => b.key === "edit").map((button) => renderItem(button, t, disabled))}
          </DropdownMenuGroup>
        )}
        {buttons.filter((b) => b.key !== "edit" && !b.danger).length > 0 && (
          <>
            {buttons.filter((b) => b.key === "edit").length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              {buttons.filter((b) => b.key !== "edit" && !b.danger).map((button) => renderItem(button, t, disabled))}
            </DropdownMenuGroup>
          </>
        )}
        {buttons.filter((b) => b.danger).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {buttons.filter((b) => b.danger).map((button) => renderItem(button, t, disabled))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function renderItem(
  button: RowActionItem,
  t: TranslateFn,
  disabled: boolean,
) {
  const Icon = ICON_MAP[button.icon] ?? Pencil;
  return (
    <DropdownMenuItem
      key={button.key}
      disabled={disabled || button.disabled}
      onSelect={button.onClick}
      className={button.danger ? "text-error focus:bg-error/10 focus:text-error" : "text-accent"}
    >
      <Icon className="size-4" strokeWidth={2} />
      <span>{t(button.labelKey)}</span>
    </DropdownMenuItem>
  );
}

