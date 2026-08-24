"use client";

import { useTranslations } from "next-intl";
import type { MessageKey, TranslateFn } from "@/src/i18n/message-key";
import { useRouter } from "@/src/i18n/navigation";
import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Power, PowerOff, Trash2, Pencil, MoreVertical } from "lucide-react";
import { statusOf } from "./helpers";
import { useCareGuideItems } from "./care-guide-items-context";

interface ActionButton {
  key: string;
  labelKey: MessageKey;
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
  t: TranslateFn;
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

export function CareGuideItemRowActions({ row }: { row: AdminCareGuideItem }) {
  const t = useTranslations();
  const router = useRouter();
  const { canWrite, canManage, isSyncing, runAction, setConfirm } =
    useCareGuideItems();

  const state = statusOf(row);
  const disabled = isSyncing(row.id);

  const buttons: ActionButton[] = [];

  if (canWrite) {
    buttons.push({
      key: "edit",
      labelKey: "careGuideItems.actions.edit",
      onClick: () => router.push(`/dashboard/care/manage/items/${row.id}/edit`),
    });
    buttons.push({
      key: state === "active" ? "deactivate" : "activate",
      labelKey:
        state === "active"
          ? "careGuideItems.actions.deactivate"
          : "careGuideItems.actions.activate",
      onClick: () => {
        if (state === "active") {
          setConfirm({ kind: "row", item: row, action: "deactivate" });
        } else {
          void runAction(row, { isActive: true });
        }
      },
    });
  }

  if (canManage) {
    buttons.push({
      key: "delete",
      labelKey: "careGuideItems.actions.delete",
      danger: true,
      onClick: () => setConfirm({ kind: "row", item: row, action: "delete" }),
    });
  }

  const editButtons = buttons.filter((button) => button.key === "edit");
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
          aria-label={t("careGuideItems.actions.menu")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {editButtons.length > 0 && (
          <DropdownMenuGroup>
            {editButtons.map((button) => (
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
            {editButtons.length > 0 && <DropdownMenuSeparator />}
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
