"use client";

import { Edit3, FileText, Trash2 } from "lucide-react";

import { SMS_DASHBOARD_ROUTES, SMS_UI } from "@/lib/sms/constants";
import type { AdminSmsTemplate } from "@/lib/sms/template-service";
import { Link } from "@/src/i18n/navigation";
import { formatSmsDate, SmsStatusBadge } from "./common";

export type TemplateLabels = {
  type: string;
  noVariables: string;
  edit: string;
  delete: string;
};

export function SmsTemplateRow({
  template,
  locale,
  canWrite,
  labels,
  onDelete,
}: {
  template: AdminSmsTemplate;
  locale: string;
  canWrite: boolean;
  labels: TemplateLabels;
  onDelete: () => void;
}) {
  const name = template.translations.fa?.name ?? template.translations.en?.name ?? template.key;
  const variables = template.variables.length
    ? template.variables.join(SMS_UI.variableSeparator)
    : labels.noVariables;
  return (
    <tr>
      <td dir="ltr" className="px-5 py-4 font-mono text-dash-caption text-content-secondary">
        {template.key}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-copper-strong" aria-hidden="true" />
          <span className="font-bold text-accent">{name}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-content-secondary">{labels.type}</td>
      <td dir="ltr" className="max-w-56 truncate px-5 py-4 text-dash-caption text-content-secondary">
        {variables}
      </td>
      <td className="px-5 py-4">
        <SmsStatusBadge status={template.isActive ? "healthy" : "unhealthy"} />
      </td>
      <td className="px-5 py-4 text-dash-caption text-content-secondary">
        {formatSmsDate(template.updatedAt, locale)}
      </td>
      <td className="px-5 py-4">
        <SmsTemplateActions
          template={template}
          canWrite={canWrite}
          labels={labels}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

export function SmsTemplateCard({
  template,
  locale,
  canWrite,
  labels,
  onDelete,
}: {
  template: AdminSmsTemplate;
  locale: string;
  canWrite: boolean;
  labels: TemplateLabels;
  onDelete: () => void;
}) {
  const name = template.translations.fa?.name ?? template.translations.en?.name ?? template.key;
  return (
    <article className="space-y-4 border-b border-border-primary p-5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-copper-strong" aria-hidden="true" />
            <h2 className="truncate font-bold text-accent">{name}</h2>
          </div>
          <p dir="ltr" className="mt-1 font-mono text-dash-caption text-content-secondary">
            {template.key}
          </p>
        </div>
        <SmsStatusBadge status={template.isActive ? "healthy" : "unhealthy"} />
      </div>
      <p className="text-dash-body-sm text-content-secondary">{labels.type}</p>
      <p dir="ltr" className="truncate text-dash-caption text-content-secondary">
        {template.variables.length
          ? template.variables.join(SMS_UI.variableSeparator)
          : labels.noVariables}
      </p>
      <p className="text-dash-caption text-content-tertiary">
        {formatSmsDate(template.updatedAt, locale)}
      </p>
      <SmsTemplateActions
        template={template}
        canWrite={canWrite}
        labels={labels}
        onDelete={onDelete}
      />
    </article>
  );
}

function SmsTemplateActions({
  template,
  canWrite,
  labels,
  onDelete,
}: {
  template: AdminSmsTemplate;
  canWrite: boolean;
  labels: TemplateLabels;
  onDelete: () => void;
}) {
  if (!canWrite) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`${SMS_DASHBOARD_ROUTES.templates}/${template.id}/edit`}
        title={labels.edit}
        aria-label={`${labels.edit}: ${template.key}`}
        className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-interactive px-3 text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Edit3 className="size-4" aria-hidden="true" />
        <span className="sr-only">{labels.edit}</span>
      </Link>
      <button
        type="button"
        onClick={onDelete}
        title={labels.delete}
        aria-label={`${labels.delete}: ${template.key}`}
        className="inline-flex min-h-11 items-center justify-center rounded-pill border border-error/30 px-3 text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        <span className="sr-only">{labels.delete}</span>
      </button>
    </div>
  );
}
