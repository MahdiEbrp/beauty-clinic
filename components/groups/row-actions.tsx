"use client";

import { useTranslations } from "next-intl";
import {
  Power,
  PowerOff,
  Trash2,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import type { AdminServiceGroup } from "@/lib/services/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusOf } from "./helpers";
import { useGroups } from "./groups-context";

interface ActionButton {
  key: string;
  labelKey: string;
  onClick: () => void;
  danger?: boolean;
}

function RowActionItem({
  button,
  disabled,
  t,
}: {
  button: ActionButton;
  disabled: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <DropdownMenuItem
      disabled={disabled}
      onSelect={button.onClick}
      className={
        button.danger
          ? "text-error focus:bg-error/10 focus:text-error"
          : "text-accent"
      }
    >
      {button.key === "edit" ? (
        <Pencil className="size-4" strokeWidth={2} />
      ) : button.key === "activate" ? (
        <Power className="size-4" strokeWidth={2} />
      ) : button.key === "deactivate" ? (
        <PowerOff className="size-4" strokeWidth={2} />
      ) : (
        <Trash2 className="size-4" strokeWidth={2} />
      )}
      <span>{t(button.labelKey)}</span>
    </DropdownMenuItem>
  );
}

export function GroupRowActions({ row }: { row: AdminServiceGroup }) {
  const t = useTranslations();
  const router = useRouter();
  const { canWrite, canManage, isSyncing, runAction, setConfirm } = useGroups();

  const state = statusOf(row);
  const disabled = isSyncing(row.id);

  const buttons: ActionButton[] = [];

  if (canWrite) {
    buttons.push({
      key: "edit",
      labelKey: "serviceGroups.actions.edit",
      onClick: () =>
        router.push(`/dashboard/services/manage/groups/${row.id}/edit`),
    });
    buttons.push({
      key: state === "active" ? "deactivate" : "activate",
      labelKey:
        state === "active"
          ? "serviceGroups.actions.deactivate"
          : "serviceGroups.actions.activate",
      onClick: () => {
        if (state === "active") {
          setConfirm({ kind: "row", group: row, action: "deactivate" });
        } else {
          void runAction(row, { isActive: true });
        }
      },
    });
  }

  if (canManage) {
    buttons.push({
      key: "delete",
      labelKey: "serviceGroups.actions.delete",
      danger: true,
      onClick: () => setConfirm({ kind: "row", group: row, action: "delete" }),
    });
  }

  const statusButtons = buttons.filter((button) =>
    ["activate", "deactivate"].includes(button.key),
  );
  const dangerButtons = buttons.filter((button) => button.key === "delete");

  if (buttons.length === 0) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={t("serviceGroups.actions.menu")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {buttons.filter((button) => button.key === "edit").length > 0 && (
          <DropdownMenuGroup>
            {buttons
              .filter((button) => button.key === "edit")
              .map((button) => (
                <RowActionItem
                  key={button.key}
                  button={button}
                  disabled={disabled}
                  t={t}
                />
              ))}
          </DropdownMenuGroup>
        )}
        {statusButtons.length > 0 && (
          <>
            {buttons.some((b) => b.key === "edit") && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              {statusButtons.map((button) => (
                <RowActionItem
                  key={button.key}
                  button={button}
                  disabled={disabled}
                  t={t}
                />
              ))}
            </DropdownMenuGroup>
          </>
        )}
        {dangerButtons.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {dangerButtons.map((button) => (
                <RowActionItem
                  key={button.key}
                  button={button}
                  disabled={disabled}
                  t={t}
                />
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
