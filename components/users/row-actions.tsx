"use client";

import { useTranslations } from "next-intl";
import type { MessageKey, TranslateFn } from "@/src/i18n/message-key";
import {
  Ban,
  ShieldCheck,
  UserX,
  UserCheck,
  UserCog,
  KeyRound,
  Trash2,
  MoreVertical,
} from "lucide-react";
import type { AdminUser } from "@/lib/users/service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusOf } from "./helpers";
import { useUsers } from "./users-context";

interface ActionButton {
  key: string;
  labelKey: MessageKey;
  onClick: () => void;
  danger?: boolean;
}

function iconFor(key: string): React.ReactNode {
  switch (key) {
    case "ban":
      return <Ban className="size-4" strokeWidth={2} />;
    case "unban":
    case "self":
      return <ShieldCheck className="size-4" strokeWidth={2} />;
    case "deactivate":
      return <UserX className="size-4" strokeWidth={2} />;
    case "activate":
      return <UserCheck className="size-4" strokeWidth={2} />;
    case "role":
      return <UserCog className="size-4" strokeWidth={2} />;
    case "password":
      return <KeyRound className="size-4" strokeWidth={2} />;
    case "delete":
      return <Trash2 className="size-4" strokeWidth={2} />;
    default:
      return <ShieldCheck className="size-4" strokeWidth={2} />;
  }
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
      disabled={disabled || button.key === "self"}
      onSelect={button.onClick}
      className={
        button.danger
          ? "text-error focus:bg-error/10 focus:text-error"
          : "text-accent"
      }
    >
      {iconFor(button.key)}
      <span>{t(button.labelKey)}</span>
    </DropdownMenuItem>
  );
}

export function RowActions({ row }: { row: AdminUser }) {
  const t = useTranslations();
  const {
    currentUser,
    isSyncing,
    runAction,
    setConfirm,
    setPasswordTarget,
    setRoleTarget,
    setRoleValue,
  } = useUsers();

  const state = statusOf(row);
  const isSelf = row.id === currentUser.id;
  const disabled = isSyncing(row.id);

  const buttons: ActionButton[] = [];

  if (isSelf) {
    buttons.push({
      key: "self",
      labelKey: "users.actions.selfNotice",
      onClick: () => undefined,
    });
  } else if (state === "banned") {
    buttons.push({
      key: "unban",
      labelKey: "users.actions.unban",
      onClick: () => void runAction(row, { isBanned: false }),
    });
  } else {
    buttons.push({
      key: state === "active" ? "deactivate" : "activate",
      labelKey:
        state === "active"
          ? "users.actions.deactivate"
          : "users.actions.activate",
      onClick: () => {
        if (state === "active") {
          setConfirm({ kind: "row", user: row, action: "deactivate" });
        } else {
          void runAction(row, { isActive: true });
        }
      },
    });
    buttons.push({
      key: "ban",
      labelKey: "users.actions.ban",
      danger: true,
      onClick: () => setConfirm({ kind: "row", user: row, action: "ban" }),
    });
  }

  if (!isSelf) {
    buttons.push({
      key: "role",
      labelKey: "users.actions.changeRole",
      onClick: () => {
        setRoleTarget(row);
        setRoleValue(row.roles[0] ?? "");
      },
    });
    buttons.push({
      key: "password",
      labelKey: "users.actions.changePassword",
      onClick: () => setPasswordTarget(row),
    });
    buttons.push({
      key: "delete",
      labelKey: "users.actions.delete",
      danger: true,
      onClick: () => setConfirm({ kind: "row", user: row, action: "delete" }),
    });
  }

  const selfButtons = buttons.filter((button) => button.key === "self");
  const statusButtons = buttons.filter((button) =>
    ["activate", "deactivate", "unban"].includes(button.key),
  );
  const accountButtons = buttons.filter((button) =>
    ["role", "password"].includes(button.key),
  );
  const dangerButtons = buttons.filter((button) =>
    ["ban", "delete"].includes(button.key),
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={t("users.actions.menu")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {selfButtons.length > 0 && (
          <DropdownMenuGroup>
            {selfButtons.map((button) => (
              <RowActionItem key={button.key} button={button} disabled={disabled} t={t} />
            ))}
          </DropdownMenuGroup>
        )}
        {selfButtons.length > 0 &&
          (statusButtons.length > 0 ||
            accountButtons.length > 0 ||
            dangerButtons.length > 0) && <DropdownMenuSeparator />}
        <DropdownMenuGroup>
          {statusButtons.map((button) => (
            <RowActionItem key={button.key} button={button} disabled={disabled} t={t} />
          ))}
        </DropdownMenuGroup>
        {statusButtons.length > 0 && accountButtons.length > 0 && (
          <DropdownMenuSeparator />
        )}
        <DropdownMenuGroup>
          {accountButtons.map((button) => (
            <RowActionItem key={button.key} button={button} disabled={disabled} t={t} />
          ))}
        </DropdownMenuGroup>
        {dangerButtons.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {dangerButtons.map((button) => (
                <RowActionItem key={button.key} button={button} disabled={disabled} t={t} />
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
