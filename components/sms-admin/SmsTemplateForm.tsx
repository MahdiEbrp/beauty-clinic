"use client";

import { AlertTriangle, ArrowRight, FileText } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Panel, Field, inputClass } from "@/components/create-group/ui";
import { SMS_API_ROUTES, SMS_DASHBOARD_ROUTES, SMS_LIMITS } from "@/lib/sms/constants";
import type { AdminSmsTemplate } from "@/lib/sms/template-service";
import { useRouter } from "@/src/i18n/navigation";
import { SmsBackLink, SmsSelect, SmsToggle, type SmsSelectOption } from "./common";
import { renderSmsPreview, parseSmsVariables, TEMPLATE_KEY_PATTERN } from "./form-utils";

type FormState = {
  key: string;
  messageType: AdminSmsTemplate["messageType"];
  faName: string;
  faContent: string;
  enName: string;
  enContent: string;
  variables: string;
  displayOrder: string;
  isActive: boolean;
};

function initialState(template?: AdminSmsTemplate): FormState {
  return {
    key: template?.key ?? "",
    messageType: template?.messageType ?? "transactional",
    faName: template?.translations.fa?.name ?? "",
    faContent: template?.translations.fa?.content ?? "",
    enName: template?.translations.en?.name ?? "",
    enContent: template?.translations.en?.content ?? "",
    variables: template?.variables.join(", ") ?? "",
    displayOrder: String(template?.displayOrder ?? SMS_LIMITS.zero),
    isActive: template?.isActive ?? true,
  };
}

export function SmsTemplateForm({ template }: { template?: AdminSmsTemplate }) {
  const t = useTranslations("smsTemplateForm");
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(template));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const typeOptions: SmsSelectOption[] = [
    { value: "transactional", label: t("types.transactional") },
    { value: "marketing", label: t("types.marketing") },
  ];
  const variableNames = parseSmsVariables(form.variables);
  const previewVariables = Object.fromEntries(
    variableNames.map((variable) => [variable, `{{${variable}}}`]),
  );

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    const variables = parseSmsVariables(form.variables);
    if (
      !form.key.trim() ||
      !TEMPLATE_KEY_PATTERN.test(form.key.trim()) ||
      !form.faName.trim() ||
      !form.faContent.trim() ||
      !form.enName.trim() ||
      !form.enContent.trim()
    ) {
      setServerError(t("errors.required"));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...(template ? {} : { key: form.key.trim() }),
        messageType: form.messageType,
        variables,
        translations: {
          fa: { name: form.faName.trim(), content: form.faContent.trim() },
          en: { name: form.enName.trim(), content: form.enContent.trim() },
        },
        displayOrder: Number(form.displayOrder) || SMS_LIMITS.zero,
        isActive: form.isActive,
      };
      const endpoint = template
        ? `${SMS_API_ROUTES.templates}/${template.id}`
        : SMS_API_ROUTES.templates;
      const response = await fetch(endpoint, {
        method: template ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? t("errors.server"));
      }
      toast.success(template ? t("toast.updated") : t("toast.created"));
      router.push(SMS_DASHBOARD_ROUTES.templates);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("errors.server"));
      toast.error(t("toast.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <SmsBackLink href={SMS_DASHBOARD_ROUTES.templates} />
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-card bg-copper/15 text-copper-strong">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-dash-display font-black tracking-tight text-accent">
              {template ? t("editHeading") : t("heading")}
            </h1>
            <p className="mt-1 max-w-2xl text-dash-body leading-7 text-content-secondary">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <Panel>
        <h2 className="text-dash-heading font-black text-accent">{t("sections.identity")}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field id="sms-template-key" label={t("fields.key")} hint={t("fields.keyHint")} required>
            <input
              id="sms-template-key"
              dir="ltr"
              value={form.key}
              onChange={(event) => setValue("key", event.target.value)}
              className={inputClass(!form.key.trim())}
              disabled={Boolean(template)}
            />
          </Field>
          <Field id="sms-template-type" label={t("fields.type")} required>
            <SmsSelect
              value={form.messageType}
              onValueChange={(value) =>
                setValue("messageType", value as FormState["messageType"])
              }
              options={typeOptions}
              placeholder={t("fields.type")}
              ariaLabel={t("fields.type")}
            />
          </Field>
          <Field id="sms-template-variables" label={t("fields.variables")} hint={t("fields.variablesHint")}>
            <input
              id="sms-template-variables"
              dir="ltr"
              value={form.variables}
              onChange={(event) => setValue("variables", event.target.value)}
              className={inputClass(false)}
            />
          </Field>
          <Field id="sms-template-order" label={t("fields.displayOrder")}>
            <input
              id="sms-template-order"
              dir="ltr"
              type="number"
              min={SMS_LIMITS.templateDisplayOrderMin}
              max={SMS_LIMITS.templateDisplayOrderMax}
              value={form.displayOrder}
              onChange={(event) => setValue("displayOrder", event.target.value)}
              className={inputClass(false)}
            />
          </Field>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-dash-heading font-black text-accent">{t("sections.content")}</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Field id="sms-template-fa-name" label={t("fields.faName")} required>
            <input
              id="sms-template-fa-name"
              value={form.faName}
              onChange={(event) => setValue("faName", event.target.value)}
              className={inputClass(!form.faName.trim())}
            />
          </Field>
          <Field id="sms-template-en-name" label={t("fields.enName")} required>
            <input
              id="sms-template-en-name"
              dir="ltr"
              value={form.enName}
              onChange={(event) => setValue("enName", event.target.value)}
              className={inputClass(!form.enName.trim())}
            />
          </Field>
          <Field id="sms-template-fa-content" label={t("fields.faContent")} required>
            <textarea
              id="sms-template-fa-content"
              value={form.faContent}
              onChange={(event) => setValue("faContent", event.target.value)}
              className={`${inputClass(!form.faContent.trim())} min-h-32 resize-y py-3`}
              maxLength={SMS_LIMITS.messageMaxLength}
            />
          </Field>
          <Field id="sms-template-en-content" label={t("fields.enContent")} required>
            <textarea
              id="sms-template-en-content"
              dir="ltr"
              value={form.enContent}
              onChange={(event) => setValue("enContent", event.target.value)}
              className={`${inputClass(!form.enContent.trim())} min-h-32 resize-y py-3`}
              maxLength={SMS_LIMITS.messageMaxLength}
            />
          </Field>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-dash-heading font-black text-accent">{t("preview")}</h2>
            <p className="mt-1 text-dash-body-sm text-content-secondary">{t("previewHint")}</p>
          </div>
          <SmsToggle
            checked={form.isActive}
            onChange={(value) => setValue("isActive", value)}
            label={t("status.active")}
          />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-border-primary bg-surface-tertiary p-4">
            <p className="text-dash-caption font-bold text-content-tertiary">{t("fields.faName")}</p>
            <p className="mt-2 whitespace-pre-wrap text-dash-body text-accent">
              {renderSmsPreview(form.faContent, previewVariables)}
            </p>
          </div>
          <div dir="ltr" className="rounded-card border border-border-primary bg-surface-tertiary p-4 text-start">
            <p className="text-dash-caption font-bold text-content-tertiary">{t("fields.enName")}</p>
            <p className="mt-2 whitespace-pre-wrap text-dash-body text-accent">
              {renderSmsPreview(form.enContent, previewVariables)}
            </p>
          </div>
        </div>
      </Panel>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-4 text-dash-body-sm text-error"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="wrap-break-word">{serverError}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(SMS_DASHBOARD_ROUTES.templates)}
          className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-interactive px-5 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? t("actions.saving") : template ? t("actions.update") : t("actions.create")}
          <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
