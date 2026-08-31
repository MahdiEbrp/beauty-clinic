"use client";

import { Activity, MoreVertical, Pencil, Send, Trash2 } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SMS_DASHBOARD_ROUTES, SMS_UI } from "@/lib/sms/constants";
import { SmsStatusBadge } from "./SmsStatusBadge";
import { formatSmsDate } from "./sms-format";

export type ProviderLabels = {
  kind: string;
  default: string;
  notConfigured: string;
  never: string;
  edit: string;
  test: string;
  delete: string;
  menu: string;
};

function ProviderIcon() {
  return (
    <span
      className="flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
      aria-hidden="true"
    >
      <Activity className="size-5" strokeWidth={1.75} />
    </span>
  );
}

function ProviderActions({
  provider,
  canSend,
  canWrite,
  canManage,
  labels,
  onTest,
  onDelete,
}: {
  provider: AdminSmsProvider;
  canSend: boolean;
  canWrite: boolean;
  canManage: boolean;
  labels: ProviderLabels;
  onTest: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const hasActions = canSend || canWrite || canManage;
  if (!hasActions) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${labels.menu}: ${provider.name}`}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canWrite && (
          <DropdownMenuItem
            onSelect={() =>
              router.push(`${SMS_DASHBOARD_ROUTES.providers}/${provider.id}/edit`)
            }
            className="text-accent"
          >
            <Pencil className="size-4" aria-hidden="true" />
            <span>{labels.edit}</span>
          </DropdownMenuItem>
        )}
        {canSend && (
          <>
            {canWrite && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={onTest} className="text-accent">
              <Send className="size-4" aria-hidden="true" />
              <span>{labels.test}</span>
            </DropdownMenuItem>
          </>
        )}
        {canManage && (
          <>
            {(canWrite || canSend) && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-error focus:bg-error/10 focus:text-error"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span>{labels.delete}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SmsProviderRow({
  provider,
  locale,
  canSend,
  canWrite,
  canManage,
  labels,
  onTest,
  onDelete,
}: {
  provider: AdminSmsProvider;
  locale: string;
  canSend: boolean;
  canWrite: boolean;
  canManage: boolean;
  labels: ProviderLabels;
  onTest: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <ProviderIcon />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-dash-body font-semibold text-accent">
                {provider.name}
              </p>
              {provider.isDefault && (
                <span className="rounded-pill bg-copper/10 px-2 py-0.5 text-dash-caption font-bold text-copper-strong">
                  {labels.default}
                </span>
              )}
            </div>
            <p className="truncate text-dash-caption text-content-tertiary">
              {labels.kind}
            </p>
          </div>
        </div>
      </td>
      <td
        dir="ltr"
        className="max-w-64 truncate px-4 py-5 text-dash-caption text-content-secondary"
      >
        {provider.apiUrl}
      </td>
      <td
        dir="ltr"
        className="px-4 py-5 font-mono text-dash-caption text-content-secondary"
      >
        {provider.tokenConfigured
          ? `${SMS_UI.maskedTokenPrefix}${provider.tokenLast4}`
          : labels.notConfigured}
      </td>
      <td className="px-4 py-5">
        <SmsStatusBadge status={provider.healthStatus} />
      </td>
      <td className="px-4 py-5 text-dash-caption text-content-secondary">
        {formatSmsDate(provider.lastHealthCheckedAt, locale) || labels.never}
      </td>
      <td className="w-16 px-2 py-5 text-end">
        <ProviderActions
          provider={provider}
          canSend={canSend}
          canWrite={canWrite}
          canManage={canManage}
          labels={labels}
          onTest={onTest}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

export function SmsProviderCard({
  provider,
  locale,
  canSend,
  canWrite,
  canManage,
  labels,
  onTest,
  onDelete,
}: {
  provider: AdminSmsProvider;
  locale: string;
  canSend: boolean;
  canWrite: boolean;
  canManage: boolean;
  labels: ProviderLabels;
  onTest: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <ProviderIcon />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-dash-body font-bold text-accent">
              {provider.name}
            </p>
            <SmsStatusBadge status={provider.healthStatus} />
          </div>
          <p className="truncate text-dash-caption text-content-tertiary">
            {labels.kind}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-dash-caption text-content-secondary">
            <span dir="ltr" className="truncate">
              {provider.tokenConfigured
                ? `${SMS_UI.maskedTokenPrefix}${provider.tokenLast4}`
                : labels.notConfigured}
            </span>
            {provider.isDefault && (
              <span className="rounded-pill bg-copper/10 px-2 py-0.5 font-bold text-copper-strong">
                {labels.default}
              </span>
            )}
            <span>
              {formatSmsDate(provider.lastHealthCheckedAt, locale) || labels.never}
            </span>
          </div>
          <p
            dir="ltr"
            className="mt-1 truncate text-dash-caption text-content-tertiary"
          >
            {provider.apiUrl}
          </p>
        </div>
        <div className="shrink-0 self-center">
          <ProviderActions
            provider={provider}
            canSend={canSend}
            canWrite={canWrite}
            canManage={canManage}
            labels={labels}
            onTest={onTest}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}
