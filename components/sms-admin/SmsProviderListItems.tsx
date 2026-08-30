"use client";

import { Activity, Edit3, Send, Trash2 } from "lucide-react";

import {
  SMS_DASHBOARD_ROUTES,
  SMS_UI,
} from "@/lib/sms/constants";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import { Link } from "@/src/i18n/navigation";
import {
  formatSmsDate,
  SmsStatusBadge,
} from "./common";

export type ProviderLabels = {
  kind: string;
  endpoint: string;
  default: string;
  configured: string;
  notConfigured: string;
  never: string;
  edit: string;
  test: string;
  delete: string;
};

export function SmsProviderRow({
  provider,
  locale,
  canSend,
  canWrite,
  labels,
  onTest,
  onDelete,
}: {
  provider: AdminSmsProvider;
  locale: string;
  canSend: boolean;
  canWrite: boolean;
  labels: ProviderLabels;
  onTest: () => void;
  onDelete: () => void;
}) {
  return (
    <tr>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-copper-strong" aria-hidden="true" />
          <span className="font-bold text-accent">{provider.name}</span>
          {provider.isDefault && (
            <span className="rounded-pill bg-copper/10 px-2 py-0.5 text-dash-caption font-bold text-copper-strong">
              {labels.default}
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-4 text-content-secondary">{labels.kind}</td>
      <td
        dir="ltr"
        className="max-w-64 truncate px-5 py-4 font-mono text-dash-caption text-content-secondary"
      >
        {provider.apiUrl}
      </td>
      <td
        dir="ltr"
        className="px-5 py-4 font-mono text-dash-caption text-content-secondary"
      >
        {provider.tokenConfigured
          ? `${SMS_UI.maskedTokenPrefix}${provider.tokenLast4}`
          : labels.notConfigured}
      </td>
      <td className="px-5 py-4">
        <SmsStatusBadge status={provider.healthStatus} />
      </td>
      <td className="px-5 py-4 text-dash-caption text-content-secondary">
        {formatSmsDate(provider.lastHealthCheckedAt, locale) || labels.never}
      </td>
      <td className="px-5 py-4">
        <SmsProviderActions
          provider={provider}
          canSend={canSend}
          canWrite={canWrite}
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
  labels,
  onTest,
  onDelete,
}: {
  provider: AdminSmsProvider;
  locale: string;
  canSend: boolean;
  canWrite: boolean;
  labels: ProviderLabels;
  onTest: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="space-y-4 border-b border-border-primary p-5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-copper-strong" aria-hidden="true" />
            <h2 className="font-bold text-accent">{provider.name}</h2>
          </div>
          <p className="mt-1 text-dash-caption text-content-secondary">{labels.kind}</p>
        </div>
        <SmsStatusBadge status={provider.healthStatus} />
      </div>
      <dl className="grid gap-3 text-dash-caption sm:grid-cols-2">
        <div>
          <dt className="text-content-tertiary">{labels.configured}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-content-primary">
            {provider.tokenConfigured
              ? `${SMS_UI.maskedTokenPrefix}${provider.tokenLast4}`
              : labels.notConfigured}
          </dd>
        </div>
        <div>
          <dt className="text-content-tertiary">{labels.never}</dt>
          <dd className="mt-1 text-content-primary">
            {formatSmsDate(provider.lastHealthCheckedAt, locale) || labels.never}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-content-tertiary">{labels.endpoint}</dt>
          <dd dir="ltr" className="mt-1 truncate font-mono text-content-primary">
            {provider.apiUrl}
          </dd>
        </div>
      </dl>
      <SmsProviderActions
        provider={provider}
        canSend={canSend}
        canWrite={canWrite}
        labels={labels}
        onTest={onTest}
        onDelete={onDelete}
      />
    </article>
  );
}

function SmsProviderActions({
  provider,
  canSend,
  canWrite,
  labels,
  onTest,
  onDelete,
}: {
  provider: AdminSmsProvider;
  canSend: boolean;
  canWrite: boolean;
  labels: ProviderLabels;
  onTest: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {canSend && (
        <button
          type="button"
          onClick={onTest}
          title={labels.test}
          aria-label={`${labels.test}: ${provider.name}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-3 text-dash-caption font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Send className="size-4" aria-hidden="true" />
          <span className="sr-only">{labels.test}</span>
        </button>
      )}
      {canWrite && (
        <Link
          href={`${SMS_DASHBOARD_ROUTES.providers}/${provider.id}/edit`}
          title={labels.edit}
          aria-label={`${labels.edit}: ${provider.name}`}
          className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-interactive px-3 text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Edit3 className="size-4" aria-hidden="true" />
          <span className="sr-only">{labels.edit}</span>
        </Link>
      )}
      {canWrite && (
        <button
          type="button"
          onClick={onDelete}
          title={labels.delete}
          aria-label={`${labels.delete}: ${provider.name}`}
          className="inline-flex min-h-11 items-center justify-center rounded-pill border border-error/30 px-3 text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span className="sr-only">{labels.delete}</span>
        </button>
      )}
    </div>
  );
}
