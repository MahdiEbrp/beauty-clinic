"use client";

import type { AdminSmsMessage } from "@/lib/sms/report-service";
import { formatSmsDate, SmsStatusBadge } from "./common";

export type MessageLabels = {
  providerFallback: string;
  noValue: string;
  providerId: string;
  created: string;
  error: string;
};

export function MessageRow({
  message,
  locale,
  labels,
}: {
  message: AdminSmsMessage;
  locale: string;
  labels: MessageLabels;
}) {
  return (
    <tr>
      <td dir="ltr" className="px-5 py-4 font-mono font-bold text-accent">{message.recipientMasked}</td>
      <td className="px-5 py-4 text-content-secondary">{message.providerName ?? labels.providerFallback}</td>
      <td className="px-5 py-4"><SmsStatusBadge status={message.status} /></td>
      <td dir="ltr" className="max-w-48 truncate px-5 py-4 font-mono text-dash-caption text-content-secondary">
        {message.providerMessageId ?? labels.noValue}
      </td>
      <td className="px-5 py-4 text-dash-caption text-content-secondary">{formatSmsDate(message.createdAt, locale)}</td>
      <td className="px-5 py-4 text-dash-caption text-content-secondary">{formatSmsDate(message.sentAt, locale) || labels.noValue}</td>
      <td className="max-w-56 truncate px-5 py-4 text-dash-caption text-error">{message.errorMessage ?? labels.noValue}</td>
    </tr>
  );
}

export function MessageCard({
  message,
  locale,
  labels,
}: {
  message: AdminSmsMessage;
  locale: string;
  labels: MessageLabels;
}) {
  return (
    <article className="space-y-4 border-b border-border-primary p-5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p dir="ltr" className="font-mono font-bold text-accent">{message.recipientMasked}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{message.providerName ?? labels.providerFallback}</p>
        </div>
        <SmsStatusBadge status={message.status} />
      </div>
      <dl className="grid gap-3 text-dash-caption sm:grid-cols-2">
        <div>
          <dt className="text-content-tertiary">{labels.providerId}</dt>
          <dd dir="ltr" className="mt-1 truncate font-mono text-content-primary">{message.providerMessageId ?? labels.noValue}</dd>
        </div>
        <div>
          <dt className="text-content-tertiary">{labels.created}</dt>
          <dd className="mt-1 text-content-primary">{formatSmsDate(message.createdAt, locale)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-content-tertiary">{labels.error}</dt>
          <dd className="mt-1 text-error">{message.errorMessage ?? labels.noValue}</dd>
        </div>
      </dl>
    </article>
  );
}
