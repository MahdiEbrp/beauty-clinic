"use client";

import { useTranslations } from "next-intl";

import { Field, Panel, inputClass } from "@/components/create-group/ui";
import { EMAIL_LIMITS } from "@/lib/email/constants";
import { renderEmailPreview, parseEmailVariables } from "./email-form-utils";
import { EmailSelect, type EmailSelectOption } from "./EmailSelect";
import { EmailToggle } from "./EmailToggle";
import type {
  EmailTemplateFormSetter,
  EmailTemplateFormState,
} from "./email-template-form-types";

export function EmailTemplateDetailsStep({
  form,
  setValue,
  locked,
}: {
  form: EmailTemplateFormState;
  setValue: EmailTemplateFormSetter;
  locked: boolean;
}) {
  const t = useTranslations("emailTemplateForm");
  const typeOptions: EmailSelectOption[] = [
    { value: "transactional", label: t("types.transactional") },
    { value: "marketing", label: t("types.marketing") },
  ];
  const formatOptions: EmailSelectOption[] = [
    { value: "plain", label: t("formatOptions.plain") },
    { value: "html", label: t("formatOptions.html") },
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
        <Field id="email-template-key" label={t("fields.key")} hint={t("fields.keyHint")} required>
          <input
            id="email-template-key"
            dir="ltr"
            value={form.key}
            onChange={(event) => setValue("key", event.target.value)}
            className={inputClass(!form.key.trim())}
            disabled={locked}
          />
        </Field>
        <Field id="email-template-type" label={t("fields.type")} required>
          <EmailSelect
            value={form.messageType}
            onValueChange={(value) =>
              setValue("messageType", value as EmailTemplateFormState["messageType"])
            }
            options={typeOptions}
            placeholder={t("fields.type")}
            ariaLabel={t("fields.type")}
          />
        </Field>
        <Field id="email-template-format" label={t("fields.format")} required>
          <EmailSelect
            value={form.contentFormat}
            onValueChange={(value) =>
              setValue("contentFormat", value as EmailTemplateFormState["contentFormat"])
            }
            options={formatOptions}
            placeholder={t("fields.format")}
            ariaLabel={t("fields.format")}
          />
        </Field>
        <Field
          id="email-template-variables"
          label={t("fields.variables")}
          hint={t("fields.variablesHint")}
        >
          <input
            id="email-template-variables"
            dir="ltr"
            value={form.variables}
            onChange={(event) => setValue("variables", event.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field id="email-template-order" label={t("fields.displayOrder")}>
          <input
            id="email-template-order"
            dir="ltr"
            type="number"
            min={EMAIL_LIMITS.templateDisplayOrderMin}
            max={EMAIL_LIMITS.templateDisplayOrderMax}
            value={form.displayOrder}
            onChange={(event) => setValue("displayOrder", event.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>
    </Panel>
  );
}

export function EmailTemplateContentStep({
  form,
  setValue,
}: {
  form: EmailTemplateFormState;
  setValue: EmailTemplateFormSetter;
}) {
  const t = useTranslations("emailTemplateForm");
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
        <Field id="email-template-fa-name" label={t("fields.faName")} required>
          <input
            id="email-template-fa-name"
            value={form.faName}
            onChange={(event) => setValue("faName", event.target.value)}
            className={inputClass(!form.faName.trim())}
          />
        </Field>
        <Field id="email-template-en-name" label={t("fields.enName")} required>
          <input
            id="email-template-en-name"
            dir="ltr"
            value={form.enName}
            onChange={(event) => setValue("enName", event.target.value)}
            className={inputClass(!form.enName.trim())}
          />
        </Field>
        <Field id="email-template-fa-subject" label={t("fields.faSubject")} required>
          <input
            id="email-template-fa-subject"
            value={form.faSubject}
            onChange={(event) => setValue("faSubject", event.target.value)}
            className={inputClass(!form.faSubject.trim())}
            maxLength={EMAIL_LIMITS.subjectMaxLength}
          />
        </Field>
        <Field id="email-template-en-subject" label={t("fields.enSubject")} required>
          <input
            id="email-template-en-subject"
            dir="ltr"
            value={form.enSubject}
            onChange={(event) => setValue("enSubject", event.target.value)}
            className={inputClass(!form.enSubject.trim())}
            maxLength={EMAIL_LIMITS.subjectMaxLength}
          />
        </Field>
        <Field id="email-template-fa-content" label={t("fields.faContent")} required>
          <textarea
            id="email-template-fa-content"
            value={form.faContent}
            onChange={(event) => setValue("faContent", event.target.value)}
            className={`${inputClass(!form.faContent.trim())} min-h-32 resize-y py-3`}
            maxLength={EMAIL_LIMITS.messageMaxLength}
          />
        </Field>
        <Field id="email-template-en-content" label={t("fields.enContent")} required>
          <textarea
            id="email-template-en-content"
            dir="ltr"
            value={form.enContent}
            onChange={(event) => setValue("enContent", event.target.value)}
            className={`${inputClass(!form.enContent.trim())} min-h-32 resize-y py-3`}
            maxLength={EMAIL_LIMITS.messageMaxLength}
          />
        </Field>
      </div>
    </Panel>
  );
}

export function EmailTemplatePreviewStep({
  form,
  setValue,
}: {
  form: EmailTemplateFormState;
  setValue: EmailTemplateFormSetter;
}) {
  const t = useTranslations("emailTemplateForm");
  const variables = parseEmailVariables(form.variables);
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
        <EmailToggle
          checked={form.isActive}
          onChange={(value) => setValue("isActive", value)}
          label={t("status.active")}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PreviewCard
          label={`${t("fields.faName")} — ${renderEmailPreview(form.faSubject, previewVariables)}`}
          content={renderEmailPreview(form.faContent, previewVariables)}
        />
        <PreviewCard
          label={`${t("fields.enName")} — ${renderEmailPreview(form.enSubject, previewVariables)}`}
          content={renderEmailPreview(form.enContent, previewVariables)}
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