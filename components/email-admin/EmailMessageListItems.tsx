"use client";

import { Trash2 } from "lucide-react";
import type { AdminEmailMessage } from "@/lib/email/report-service";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { formatEmailDate } from "./email-format";

export type MessageLabels = {
  providerFallback: string;
  noValue: string;
  providerId: string;
  created: string;
  error: string;
  delete: string;
};

export function MessageRow({
  message,
  locale,
  labels,
  selected,
  onSelect,
  onDelete,
}: {
  message: AdminEmailMessage;
  locale: string;
  labels: MessageLabels;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onDelete?: (message: AdminEmailMessage) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      {onSelect && (
        <td className="w-10 px-2 py-5">
          <input
            type="checkbox"
            checked={selected ?? false}
            onChange={(e) => onSelect(message.id, e.target.checked)}
            className="size-4 rounded border-border-primary accent-accent"
          />
        </td>
      )}
      <td dir="ltr" className="px-4 py-5 font-mono font-bold text-accent">{message.recipientMasked}</td>
      <td className="px-4 py-5 text-content-secondary">{message.providerName ?? labels.providerFallback}</td>
      <td className="px-4 py-5"><EmailStatusBadge status={message.status} /></td>
      <td dir="ltr" className="max-w-48 truncate px-4 py-5 font-mono text-dash-caption text-content-secondary">
        {message.providerMessageId ?? labels.noValue}
      </td>
      <td className="px-4 py-5 text-dash-caption text-content-secondary">{formatEmailDate(message.createdAt, locale)}</td>
      <td className="px-4 py-5 text-dash-caption text-content-secondary">{formatEmailDate(message.sentAt, locale) || labels.noValue}</td>
      <td className="max-w-56 truncate px-4 py-5 text-dash-caption text-error">{message.errorMessage ?? labels.noValue}</td>
      {onDelete && (
        <td className="w-12 px-2 py-5">
          <button
            type="button"
            onClick={() => onDelete(message)}
            aria-label={labels.delete}
            className="inline-flex size-9 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-error shadow-elevation-1 transition hover:bg-error/10 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Trash2 className="size-4" />
          </button>
        </td>
      )}
    </tr>
  );
}

export function MessageCard({
  message,
  locale,
  labels,
  selected,
  onSelect,
  onDelete,
}: {
  message: AdminEmailMessage;
  locale: string;
  labels: MessageLabels;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onDelete?: (message: AdminEmailMessage) => void;
}) {
  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected ?? false}
              onChange={(e) => onSelect(message.id, e.target.checked)}
              className="mt-1 size-4 rounded border-border-primary accent-accent"
            />
          )}
          <div>
            <p dir="ltr" className="font-mono font-bold text-accent">{message.recipientMasked}</p>
            <p className="mt-1 text-dash-caption text-content-secondary">{message.providerName ?? labels.providerFallback}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EmailStatusBadge status={message.status} />
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(message)}
              aria-label={labels.delete}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-error shadow-elevation-1 transition hover:bg-error/10 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
      <dl className="grid gap-3 text-dash-caption sm:grid-cols-2">
        <div>
          <dt className="text-content-tertiary">{labels.providerId}</dt>
          <dd dir="ltr" className="mt-1 truncate font-mono text-content-primary">{message.providerMessageId ?? labels.noValue}</dd>
        </div>
        <div>
          <dt className="text-content-tertiary">{labels.created}</dt>
          <dd className="mt-1 text-content-primary">{formatEmailDate(message.createdAt, locale)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-content-tertiary">{labels.error}</dt>
          <dd className="mt-1 text-error">{message.errorMessage ?? labels.noValue}</dd>
        </div>
      </dl>
    </article>
  );
}
