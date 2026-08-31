"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel, Field, inputClass } from "@/components/create-group/ui";
import { SMS_LIMITS, SMS_SEND_MODES } from "@/lib/sms/constants";
import type { AdminSmsTemplate } from "@/lib/sms/template-service";
import { SmsSelect, type SmsSelectOption } from "./SmsSelect";

export type SmsComposeMode = (typeof SMS_SEND_MODES)[keyof typeof SMS_SEND_MODES];

export function SmsSendFormFields({
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
  sender,
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
  onSenderChange,
  onVariableChange,
  onClear,
  showRecipients = true,
}: {
  mode: SmsComposeMode;
  providerId: string;
  providerOptions: SmsSelectOption[];
  templateId: string;
  templateOptions: SmsSelectOption[];
  locale: string;
  localeOptions: SmsSelectOption[];
  campaignName: string;
  recipientsText: string;
  message: string;
  sender: string;
  selectedTemplate?: AdminSmsTemplate;
  selectedTranslation?: { name: string; content: string };
  variables: Record<string, string>;
  error: string | null;
  onModeChange: (mode: SmsComposeMode) => void;
  onProviderChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onLocaleChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onRecipientsChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSenderChange: (value: string) => void;
  onVariableChange: (name: string, value: string) => void;
  onClear: () => void;
  showRecipients?: boolean;
}) {
  const t = useTranslations("smsSend");
  return (
    <>
      <Panel>
        <div className="flex flex-wrap gap-2">
          <ModeButton active={mode === SMS_SEND_MODES.custom} label={t("mode.custom")} onClick={() => onModeChange(SMS_SEND_MODES.custom)} />
          <ModeButton active={mode === SMS_SEND_MODES.template} label={t("mode.template")} onClick={() => onModeChange(SMS_SEND_MODES.template)} />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field id="sms-send-provider" label={t("fields.provider")} required>
            <SmsSelect value={providerId} onValueChange={onProviderChange} options={providerOptions} placeholder={t("options.chooseProvider")} ariaLabel={t("fields.provider")} />
          </Field>
          {mode === SMS_SEND_MODES.template && (
            <Field id="sms-send-template" label={t("fields.template")} required>
              <SmsSelect value={templateId} onValueChange={onTemplateChange} options={templateOptions} placeholder={t("options.chooseTemplate")} ariaLabel={t("fields.template")} />
            </Field>
          )}
          <Field id="sms-send-locale" label={t("fields.locale")}>
            <SmsSelect value={locale} onValueChange={onLocaleChange} options={localeOptions} placeholder={t("fields.locale")} ariaLabel={t("fields.locale")} />
          </Field>
          <Field id="sms-send-campaign" label={t("fields.campaignName")}>
            <input id="sms-send-campaign" value={campaignName} onChange={(event) => onCampaignChange(event.target.value)} className={inputClass(false)} maxLength={SMS_LIMITS.campaignNameMaxLength} />
          </Field>
        </div>
      </Panel>

      {showRecipients && (
        <Panel>
          <Field id="sms-send-recipients" label={t("fields.recipients")} hint={t("fields.recipientsHint")} required>
            <textarea id="sms-send-recipients" dir="ltr" inputMode="tel" value={recipientsText} onChange={(event) => onRecipientsChange(event.target.value)} className={`${inputClass(Boolean(error) && recipientsText.trim().length === SMS_LIMITS.emptyLength)} min-h-36 resize-y py-3`} />
          </Field>
        </Panel>
      )}
      <Panel>
        {mode === SMS_SEND_MODES.custom ? (
          <Field id="sms-send-message" label={t("fields.message")} hint={t("fields.messageHint")} required>
            <textarea id="sms-send-message" value={message} onChange={(event) => onMessageChange(event.target.value)} className={`${inputClass(Boolean(error) && !message.trim())} mt-1 min-h-40 resize-y py-3`} maxLength={SMS_LIMITS.messageMaxLength} />
          </Field>
        ) : (
          <div className="mt-5 space-y-4">
            {selectedTemplate?.variables.map((variable) => (
              <Field key={variable} id={`sms-send-variable-${variable}`} label={variable} hint={t("fields.variablePlaceholder", { name: variable })} required>
                <input id={`sms-send-variable-${variable}`} value={variables[variable] ?? ""} onChange={(event) => onVariableChange(variable, event.target.value)} className={inputClass(Boolean(error) && !variables[variable]?.trim())} />
              </Field>
            ))}
            {selectedTranslation && <p className="whitespace-pre-wrap rounded-card border border-border-primary bg-surface-tertiary p-4 text-dash-body-sm text-accent">{selectedTranslation.content}</p>}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="sms-send-sender" label={t("fields.sender")}>
            <input id="sms-send-sender" dir="ltr" value={sender} onChange={(event) => onSenderChange(event.target.value)} className={inputClass(false)} maxLength={SMS_LIMITS.providerSenderMaxLength} />
          </Field>
          <div className="flex items-end justify-end">
            <button type="button" onClick={onClear} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <Trash2 className="size-4" aria-hidden="true" />
              {t("actions.clear")}
            </button>
          </div>
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
