"use client";

import { FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import type { AdminSmsTemplate } from "@/lib/sms/template-service";
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

export type TemplateLabels = {
  type: string;
  noVariables: string;
  edit: string;
  delete: string;
  menu: string;
};

function TemplateIcon() {
  return (
    <span
      className="flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
      aria-hidden="true"
    >
      <FileText className="size-5" strokeWidth={1.75} />
    </span>
  );
}

function templateName(template: AdminSmsTemplate) {
  return (
    template.translations.fa?.name ??
    template.translations.en?.name ??
    template.key
  );
}

function TemplateActions({
  template,
  canWrite,
  canManage,
  labels,
  onDelete,
}: {
  template: AdminSmsTemplate;
  canWrite: boolean;
  canManage: boolean;
  labels: TemplateLabels;
  onDelete: () => void;
}) {
  const router = useRouter();
  if (!canWrite && !canManage) return null;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${labels.menu}: ${template.key}`}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canWrite && (
          <DropdownMenuItem
            onSelect={() =>
              router.push(`${SMS_DASHBOARD_ROUTES.templates}/${template.id}/edit`)
            }
            className="text-accent"
          >
            <Pencil className="size-4" aria-hidden="true" />
            <span>{labels.edit}</span>
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            {canWrite && <DropdownMenuSeparator />}
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

export function SmsTemplateRow({
  template,
  locale,
  canWrite,
  canManage,
  labels,
  onDelete,
}: {
  template: AdminSmsTemplate;
  locale: string;
  canWrite: boolean;
  canManage: boolean;
  labels: TemplateLabels;
  onDelete: () => void;
}) {
  const name = templateName(template);
  const variables = template.variables.length
    ? template.variables.join(SMS_UI.variableSeparator)
    : labels.noVariables;
  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <TemplateIcon />
          <div className="min-w-0">
            <p className="truncate text-dash-body font-semibold text-accent">
              {name}
            </p>
            <p dir="ltr" className="truncate font-mono text-dash-caption text-content-tertiary">
              {template.key}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-5 text-content-secondary">{labels.type}</td>
      <td dir="ltr" className="max-w-56 truncate px-4 py-5 text-dash-caption text-content-secondary">
        {variables}
      </td>
      <td className="px-4 py-5">
        <SmsStatusBadge status={template.isActive ? "healthy" : "unhealthy"} />
      </td>
      <td className="px-4 py-5 text-dash-caption text-content-secondary">
        {formatSmsDate(template.updatedAt, locale)}
      </td>
      <td className="w-16 px-2 py-5 text-end">
        <TemplateActions
          template={template}
          canWrite={canWrite}
          canManage={canManage}
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
  canManage,
  labels,
  onDelete,
}: {
  template: AdminSmsTemplate;
  locale: string;
  canWrite: boolean;
  canManage: boolean;
  labels: TemplateLabels;
  onDelete: () => void;
}) {
  const name = templateName(template);
  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <TemplateIcon />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-dash-body font-bold text-accent">{name}</p>
            <SmsStatusBadge status={template.isActive ? "healthy" : "unhealthy"} />
          </div>
          <p dir="ltr" className="truncate font-mono text-dash-caption text-content-tertiary">
            {template.key}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-dash-caption text-content-secondary">
            <span>{labels.type}</span>
            <span dir="ltr" className="truncate">
              {template.variables.length
                ? template.variables.join(SMS_UI.variableSeparator)
                : labels.noVariables}
            </span>
            <span>{formatSmsDate(template.updatedAt, locale)}</span>
          </div>
        </div>
        <div className="shrink-0 self-center">
          <TemplateActions
            template={template}
            canWrite={canWrite}
            canManage={canManage}
            labels={labels}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}
