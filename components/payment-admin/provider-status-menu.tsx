"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAdminListContext } from "@/components/admin-list/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { msgKey } from "@/src/i18n/message-key";
import type { PaymentProviderAdmin } from "@/lib/payment/admin-types";

const PROVIDER_STATUS_CLASS: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive:
    "bg-surface-tertiary text-content-secondary border-border-primary",
};

export function ProviderStatusMenu({ row }: { row: PaymentProviderAdmin }) {
  const t = useTranslations();
  const ctx = useAdminListContext<PaymentProviderAdmin>();
  const syncing = ctx.isSyncing(row.id);
  const active = row.isActive;

  const trigger = (
    <button
      type="button"
      disabled={syncing}
      aria-label={t(msgKey("paymentAdmin.statusMenu.label"))}
      className="inline-flex min-h-11 items-center gap-1 rounded-pill border bg-clip-padding p-1.5 text-start transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none"
    >
      <StatusPill active={active} />
      <ChevronDown
        className="size-3.5 text-content-tertiary"
        aria-hidden="true"
      />
    </button>
  );

  const nextAction = active ? "deactivate" : "activate";
  const nextLabel = active
    ? t(msgKey("paymentAdmin.actions.deactivate"))
    : t(msgKey("paymentAdmin.actions.activate"));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="px-2 py-1.5 text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
          {t(msgKey("paymentAdmin.statusMenu.current"))} •{" "}
          {active
            ? t(msgKey("paymentAdmin.statuses.active"))
            : t(msgKey("paymentAdmin.statuses.inactive"))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={syncing}
          onSelect={() =>
            ctx.setConfirm({
              kind: "row",
              action: nextAction,
              row,
            })
          }
        >
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${
              active
                ? PROVIDER_STATUS_CLASS.inactive
                : PROVIDER_STATUS_CLASS.active
            }`}
          />
          <span>{nextLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusPill({ active }: { active: boolean }) {
  const t = useTranslations();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${
        active ? PROVIDER_STATUS_CLASS.active : PROVIDER_STATUS_CLASS.inactive
      }`}
    >
      <span className="size-2 shrink-0 rounded-full bg-current" />
      {active
        ? t(msgKey("paymentAdmin.statuses.active"))
        : t(msgKey("paymentAdmin.statuses.inactive"))}
    </span>
  );
}