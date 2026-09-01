"use client";

import { useTranslations } from "next-intl";

import { Field, Panel, inputClass } from "@/components/create-group/ui";
import { SMS_LIMITS } from "@/lib/sms/constants";
import { renderSmsPreview, parseSmsVariables } from "./form-utils";
import { SmsSelect, type SmsSelectOption } from "./SmsSelect";
import { SmsToggle } from "./SmsToggle";
import type {
  SmsTemplateFormSetter,
  SmsTemplateFormState,
} from "./sms-template-form-types";

export function SmsTemplateDetailsStep({
  form,
  setValue,
  locked,
}: {
  form: SmsTemplateFormState;
  setValue: SmsTemplateFormSetter;
  locked: boolean;
}) {
  const t = useTranslations("smsTemplateForm");
  const typeOptions: SmsSelectOption[] = [
    { value: "transactional", label: t("types.transactional") },
    { value: "marketing", label: t("types.marketing") },
  ];
  return (
    <Panel>
      <div className="mb-6">
        <h2 className="text-dash-heading font-bold text-content-primary">
          {t("sections.identity")}
        </h2>
        <p className="mt-1 text-dash-body-sm text-content-secondary">
          {t("sections.identityHint")}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="sms-template-key" label={t("fields.key")} hint={t("fields.keyHint")} required>
          <input
            id="sms-template-key"
            dir="ltr"
            value={form.key}
            onChange={(event) => setValue("key", event.target.value)}
            className={inputClass(!form.key.trim())}
            disabled={locked}
          />
        </Field>
        <Field id="sms-template-type" label={t("fields.type")} required>
          <SmsSelect
            value={form.messageType}
            onValueChange={(value) =>
              setValue("messageType", value as SmsTemplateFormState["messageType"])
            }
            options={typeOptions}
            placeholder={t("fields.type")}
            ariaLabel={t("fields.type")}
          />
        </Field>
        <Field
          id="sms-template-variables"
          label={t("fields.variables")}
          hint={t("fields.variablesHint")}
        >
          <input
            id="sms-template-variables"
            dir="ltr"
            value={form.variables}
            onChange={(event) => setValue("variables", event.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field
          id="sms-template-external-id"
          label={t("fields.externalTemplateId")}
          hint={t("fields.externalTemplateIdHint")}
        >
          <input
            id="sms-template-external-id"
            dir="ltr"
            inputMode="numeric"
            value={form.externalTemplateId}
            onChange={(event) => setValue("externalTemplateId", event.target.value)}
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
  );
}

export function SmsTemplateContentStep({
  form,
  setValue,
}: {
  form: SmsTemplateFormState;
  setValue: SmsTemplateFormSetter;
}) {
  const t = useTranslations("smsTemplateForm");
  return (
    <Panel>
      <div className="mb-6">
        <h2 className="text-dash-heading font-bold text-content-primary">
          {t("sections.content")}
        </h2>
        <p className="mt-1 text-dash-body-sm text-content-secondary">
          {t("sections.contentHint")}
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
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
  );
}

export function SmsTemplatePreviewStep({
  form,
  setValue,
}: {
  form: SmsTemplateFormState;
  setValue: SmsTemplateFormSetter;
}) {
  const t = useTranslations("smsTemplateForm");
  const variables = parseSmsVariables(form.variables);
  const previewVariables = Object.fromEntries(
    variables.map((variable) => [variable, `{{${variable}}}`]),
  );
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-dash-heading font-bold text-content-primary">
            {t("preview")}
          </h2>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("previewHint")}
          </p>
        </div>
        <SmsToggle
          checked={form.isActive}
          onChange={(value) => setValue("isActive", value)}
          label={t("status.active")}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PreviewCard
          label={t("fields.faName")}
          content={renderSmsPreview(form.faContent, previewVariables)}
        />
        <PreviewCard
          label={t("fields.enName")}
          content={renderSmsPreview(form.enContent, previewVariables)}
          dir="ltr"
        />
      </div>
    </Panel>
  );
}

function PreviewCard({
  label,
  content,
  dir,
}: {
  label: string;
  content: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div
      dir={dir}
      className="rounded-card border border-border-primary bg-surface-tertiary p-4"
    >
      <p className="text-dash-caption font-bold text-content-tertiary">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-dash-body text-accent">{content}</p>
    </div>
  );
}
