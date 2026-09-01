"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel, Field, inputClass } from "@/components/create-group/ui";
import { EMAIL_LIMITS, EMAIL_SEND_MODES } from "@/lib/email/constants";
import type { AdminEmailTemplate } from "@/lib/email/template-service";
import { EmailSelect, type EmailSelectOption } from "./EmailSelect";

export type EmailComposeMode = (typeof EMAIL_SEND_MODES)[keyof typeof EMAIL_SEND_MODES];

export function EmailSendFormFields({
  mode,
  providerId,
  providerOptions,
  templateId,
  templateOptions,
  locale,
  localeOptions,
  campaignName,
  recipientsText,
  message,
  subject,
  selectedTemplate,
  selectedTranslation,
  variables,
  error,
  onModeChange,
  onProviderChange,
  onTemplateChange,
  onLocaleChange,
  onCampaignChange,
  onRecipientsChange,
  onMessageChange,
  onSubjectChange,
  onVariableChange,
  onClear,
  showRecipients = true,
}: {
  mode: EmailComposeMode;
  providerId: string;
  providerOptions: EmailSelectOption[];
  templateId: string;
  templateOptions: EmailSelectOption[];
  locale: string;
  localeOptions: EmailSelectOption[];
  campaignName: string;
  recipientsText: string;
  message: string;
  subject: string;
  selectedTemplate?: AdminEmailTemplate;
  selectedTranslation?: { name: string; subject: string; content: string };
  variables: Record<string, string>;
  error: string | null;
  onModeChange: (mode: EmailComposeMode) => void;
  onProviderChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onLocaleChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onRecipientsChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onVariableChange: (name: string, value: string) => void;
  onClear: () => void;
  showRecipients?: boolean;
}) {
  const t = useTranslations("emailSend");
  return (
    <>
      <Panel>
        <div className="flex flex-wrap gap-2">
          <ModeButton active={mode === EMAIL_SEND_MODES.custom} label={t("mode.custom")} onClick={() => onModeChange(EMAIL_SEND_MODES.custom)} />
          <ModeButton active={mode === EMAIL_SEND_MODES.template} label={t("mode.template")} onClick={() => onModeChange(EMAIL_SEND_MODES.template)} />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field id="email-send-provider" label={t("fields.provider")} required>
            <EmailSelect value={providerId} onValueChange={onProviderChange} options={providerOptions} placeholder={t("options.chooseProvider")} ariaLabel={t("fields.provider")} />
          </Field>
          {mode === EMAIL_SEND_MODES.template && (
            <Field id="email-send-template" label={t("fields.template")} required>
              <EmailSelect value={templateId} onValueChange={onTemplateChange} options={templateOptions} placeholder={t("options.chooseTemplate")} ariaLabel={t("fields.template")} />
            </Field>
          )}
          <Field id="email-send-locale" label={t("fields.locale")}>
            <EmailSelect value={locale} onValueChange={onLocaleChange} options={localeOptions} placeholder={t("fields.locale")} ariaLabel={t("fields.locale")} />
          </Field>
          <Field id="email-send-campaign" label={t("fields.campaignName")}>
            <input id="email-send-campaign" value={campaignName} onChange={(event) => onCampaignChange(event.target.value)} className={inputClass(false)} maxLength={EMAIL_LIMITS.campaignNameMaxLength} />
          </Field>
        </div>
      </Panel>

      {showRecipients && (
        <Panel>
          <Field id="email-send-recipients" label={t("fields.recipients")} hint={t("fields.recipientsHint")} required>
            <textarea id="email-send-recipients" dir="ltr" value={recipientsText} onChange={(event) => onRecipientsChange(event.target.value)} className={`${inputClass(Boolean(error) && recipientsText.trim().length === EMAIL_LIMITS.emptyLength)} min-h-36 resize-y py-3`} />
          </Field>
        </Panel>
      )}
      <Panel>
        <Field id="email-send-subject" label={t("fields.subject")} hint={t("fields.subjectHint")} required>
          <input id="email-send-subject" value={subject} onChange={(event) => onSubjectChange(event.target.value)} className={inputClass(Boolean(error) && !subject.trim())} maxLength={EMAIL_LIMITS.subjectMaxLength} />
        </Field>
        {mode === EMAIL_SEND_MODES.custom ? (
          <div className="mt-5">
            <Field id="email-send-message" label={t("fields.message")} hint={t("fields.messageHint")} required>
              <textarea id="email-send-message" value={message} onChange={(event) => onMessageChange(event.target.value)} className={`${inputClass(Boolean(error) && !message.trim())} mt-1 min-h-40 resize-y py-3`} maxLength={EMAIL_LIMITS.messageMaxLength} />
            </Field>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {selectedTemplate?.variables.map((variable) => (
              <Field key={variable} id={`email-send-variable-${variable}`} label={variable} hint={t("fields.variablePlaceholder", { name: variable })} required>
                <input id={`email-send-variable-${variable}`} value={variables[variable] ?? ""} onChange={(event) => onVariableChange(variable, event.target.value)} className={inputClass(Boolean(error) && !variables[variable]?.trim())} maxLength={EMAIL_LIMITS.variableValueMaxLength} />
              </Field>
            ))}
            {selectedTranslation && <p className="whitespace-pre-wrap rounded-card border border-border-primary bg-surface-tertiary p-4 text-dash-body-sm text-accent">{selectedTranslation.content}</p>}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="flex items-end justify-end">
          <button type="button" onClick={onClear} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Trash2 className="size-4" aria-hidden="true" />
            {t("actions.clear")}
          </button>
        </div>
      </Panel>
    </>
  );
}

function ModeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`inline-flex min-h-11 items-center justify-center rounded-pill px-4 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? "bg-accent text-content-contrast" : "border border-border-interactive text-accent hover:bg-surface-tertiary"}`}>
      {label}
    </button>
  );
}
