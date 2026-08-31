"use client";

import { Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Field, inputClass, Panel } from "@/components/create-group/ui";
import {
  SMS_API_ROUTES,
  SMS_DASHBOARD_ROUTES,
  SMS_LIMITS,
  SMS_LOCALES,
  SMS_SEND_MODES,
} from "@/lib/sms/constants";
import { getSmsLengthLabel } from "@/lib/sms/message";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import type { AdminSmsTemplate } from "@/lib/sms/template-service";
import type { SmsSendSummary } from "@/lib/sms/send-service";
import type { SmsRecipient } from "@/lib/sms/report-service";
import { Link } from "@/src/i18n/navigation";
import type { SmsSelectOption } from "./SmsSelect";
import { parseSmsRecipients } from "./form-utils";
import { SmsSendFormFields, type SmsComposeMode } from "./SmsSendFormFields";
import { SmsRecipientPicker } from "./SmsRecipientPicker";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import { SmsSendReview } from "./SmsSendReview";

type SendMode = SmsComposeMode;
type SendLocale = (typeof SMS_LOCALES)[keyof typeof SMS_LOCALES];
const SEND_STEPS = [
  { id: 1, key: "recipients" },
  { id: 2, key: "content" },
  { id: 3, key: "review" },
] as const;

export function SmsSendContent({
  providerItems,
  templateItems,
}: {
  providerItems: AdminSmsProvider[];
  templateItems: AdminSmsTemplate[];
}) {
  const t = useTranslations("smsSend");
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<SmsRecipient[]>([]);
  const [mode, setMode] = useState<SendMode>(SMS_SEND_MODES.custom);
  const [providerId, setProviderId] = useState(providerItems[0]?.id ?? "");
  const [templateId, setTemplateId] = useState("");
  const [locale, setLocale] = useState<SendLocale>(SMS_LOCALES.fa);
  const wizardLocale = locale === "en" ? "en" : "fa";
  const [recipientsText, setRecipientsText] = useState("");
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmsSendSummary | null>(null);
  const selectedTemplate = templateItems.find((template) => template.id === templateId);
  const selectedTranslation = selectedTemplate?.translations[locale];
  const composedMessage = mode === SMS_SEND_MODES.template
    ? selectedTranslation?.content ?? ""
    : message;
  const recipients = useMemo(
    () => [...new Set([...selectedUsers.map((user) => user.phone), ...parseSmsRecipients(recipientsText)])],
    [recipientsText, selectedUsers],
  );
  const length = getSmsLengthLabel(composedMessage);
  const canSend = providerItems.length > SMS_LIMITS.emptyLength;

  const providerOptions: SmsSelectOption[] = providerItems.map((provider) => ({
    value: provider.id,
    label: provider.name,
  }));
  const templateOptions: SmsSelectOption[] = templateItems.map((template) => ({
    value: template.id,
    label: template.translations[SMS_LOCALES.fa]?.name ?? template.key,
  }));
  const localeOptions: SmsSelectOption[] = [
    { value: SMS_LOCALES.fa, label: t("options.fa") },
    { value: SMS_LOCALES.en, label: t("options.en") },
  ];

  function changeTemplate(value: string) {
    setTemplateId(value);
    const selected = templateItems.find((template) => template.id === value);
    setVariables(
      Object.fromEntries((selected?.variables ?? []).map((variable) => [variable, ""])),
    );
    setResult(null);
  }

  function resetForm() {
    setRecipientsText("");
    setSelectedUsers([]);
    setMessage("");
    setSender("");
    setCampaignName("");
    setVariables({});
    setResult(null);
    setError(null);
  }

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!providerId || !canSend || recipients.length === SMS_LIMITS.emptyLength || !composedMessage.trim()) {
      setError(t("errors.required"));
      return;
    }
    if (
      mode === SMS_SEND_MODES.template &&
      (selectedTemplate === undefined ||
        selectedTemplate.variables.some((variable) => !variables[variable]?.trim()))
    ) {
      setError(t("errors.templateVariables"));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        providerId,
        ...(mode === SMS_SEND_MODES.template && templateId ? { templateId } : {}),
        messageType: selectedTemplate?.messageType ?? "transactional",
        sender: sender.trim() || undefined,
        recipients,
        ...(mode === SMS_SEND_MODES.custom ? { message: message.trim() } : {}),
        locale,
        ...(mode === SMS_SEND_MODES.template ? { variables } : {}),
        campaignName: campaignName.trim() || undefined,
      };
      const response = await fetch(SMS_API_ROUTES.messages, {
        method: "POST",
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
      const body = (await response.json()) as { data: SmsSendSummary };
      setResult(body.data);
      toast.success(t("summary.success"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("errors.server"));
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (step === 1 && recipients.length === SMS_LIMITS.emptyLength) {
      setError(t("errors.recipientsRequired"));
      return;
    }
    if (step === 2 && (!providerId || !canSend || !composedMessage.trim())) {
      setError(t("errors.required"));
      return;
    }
    setError(null);
    setStep((current) => Math.min(SEND_STEPS.length, current + 1));
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={SEND_STEPS[step - 1]?.key ?? "recipients"}
        total={SEND_STEPS.length}
        lang={wizardLocale}
        langAware={false}
        heading={t("heading")}
        subtitle={t("description")}
        onLangChange={() => undefined}
        onGoTo={(next) => setStep(next)}
        ns="smsSend"
        steps={SEND_STEPS}
        backHref={SMS_DASHBOARD_ROUTES.root}
      />

      {!canSend ? (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-dash-heading font-black text-accent">{t("errors.noProvider")}</h2>
              <p className="mt-1 text-dash-body-sm text-content-secondary">{t("errors.noProvider")}</p>
            </div>
            <Link
              href={SMS_DASHBOARD_ROUTES.addProvider}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Send className="size-4" aria-hidden="true" />
              {t("actions.manageProviders")}
            </Link>
          </div>
        </Panel>
      ) : (
        <form ref={formRef} onSubmit={(event) => void submit(event)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <SmsRecipientPicker selected={selectedUsers} onChange={setSelectedUsers} />
              <Panel>
                <Field id="sms-send-recipients" label={t("fields.recipients")} hint={t("fields.recipientsHint")} required>
                  <textarea id="sms-send-recipients" dir="ltr" inputMode="tel" value={recipientsText} onChange={(event) => setRecipientsText(event.target.value)} className={`${inputClass(Boolean(error) && recipients.length === SMS_LIMITS.emptyLength)} min-h-36 resize-y py-3`} />
                </Field>
              </Panel>
            </div>
          )}
          {step === 2 && (
            <SmsSendFormFields
              mode={mode}
              providerId={providerId}
              providerOptions={providerOptions}
              templateId={templateId}
              templateOptions={templateOptions}
              locale={locale}
              localeOptions={localeOptions}
              campaignName={campaignName}
              recipientsText={recipientsText}
              message={message}
              sender={sender}
              selectedTemplate={selectedTemplate}
              selectedTranslation={selectedTranslation}
              variables={variables}
              error={error}
              onModeChange={setMode}
              onProviderChange={setProviderId}
              onTemplateChange={changeTemplate}
              onLocaleChange={(value) => setLocale(value as SendLocale)}
              onCampaignChange={setCampaignName}
              onRecipientsChange={setRecipientsText}
              onMessageChange={setMessage}
              onSenderChange={setSender}
              onVariableChange={(name, value) => setVariables((current) => ({ ...current, [name]: value }))}
              onClear={resetForm}
              showRecipients={false}
            />
          )}
          {step === 3 && (
            <SmsSendReview recipientCount={recipients.length} length={length} error={error} result={result} submitting={submitting} />
          )}
        </form>
      )}
      {canSend && (
        <WizardActionBar
          step={step}
          total={SEND_STEPS.length}
          submitting={submitting}
          onBack={() => setStep((current) => Math.max(1, current - 1))}
          onPrimary={() => {
            if (step === SEND_STEPS.length) formRef.current?.requestSubmit();
            else goNext();
          }}
          ns="smsSend"
        />
      )}
    </div>
  );
}
