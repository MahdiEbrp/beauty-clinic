"use client";

import { Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Field, inputClass, Panel } from "@/components/create-group/ui";
import {
  EMAIL_API_ROUTES,
  EMAIL_DASHBOARD_ROUTES,
  EMAIL_LIMITS,
  EMAIL_LOCALES,
  EMAIL_SEND_MODES,
} from "@/lib/email/constants";
import { getEmailLengthLabel } from "@/lib/email/message";
import type { AdminEmailProvider } from "@/lib/email/provider-service";
import type { AdminEmailTemplate } from "@/lib/email/template-service";
import type { EmailSendSummary } from "@/lib/email/send-service";
import type { EmailRecipient } from "@/lib/email/report-service";
import { Link } from "@/src/i18n/navigation";
import type { EmailSelectOption } from "./EmailSelect";
import { parseEmailRecipients } from "./email-form-utils";
import { EmailSendFormFields, type EmailComposeMode } from "./EmailSendFormFields";
import { EmailRecipientPicker } from "./EmailRecipientPicker";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import { EmailSendReview } from "./EmailSendReview";

type SendMode = EmailComposeMode;
type SendLocale = (typeof EMAIL_LOCALES)[keyof typeof EMAIL_LOCALES];
const SEND_STEPS = [
  { id: 1, key: "recipients" },
  { id: 2, key: "content" },
  { id: 3, key: "review" },
] as const;

export function EmailSendContent({
  providerItems,
  templateItems,
}: {
  providerItems: AdminEmailProvider[];
  templateItems: AdminEmailTemplate[];
}) {
  const t = useTranslations("emailSend");
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<EmailRecipient[]>([]);
  const [mode, setMode] = useState<SendMode>(EMAIL_SEND_MODES.custom);
  const [providerId, setProviderId] = useState(providerItems[0]?.id ?? "");
  const [templateId, setTemplateId] = useState("");
  const [locale, setLocale] = useState<SendLocale>(EMAIL_LOCALES.fa);
  const wizardLocale = locale === "en" ? "en" : "fa";
  const [recipientsText, setRecipientsText] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailSendSummary | null>(null);
  const selectedTemplate = templateItems.find((template) => template.id === templateId);
  const selectedTranslation = selectedTemplate?.translations[locale];
  const contentFormat = selectedTemplate?.contentFormat ?? "html";
  const composedMessage = mode === EMAIL_SEND_MODES.template
    ? selectedTranslation?.content ?? ""
    : message;
  const recipients = useMemo(
    () => [
      ...new Set([
        ...selectedUsers.map((user) => user.email).filter((email): email is string => Boolean(email)),
        ...parseEmailRecipients(recipientsText),
      ]),
    ],
    [recipientsText, selectedUsers],
  );
  const length = getEmailLengthLabel(composedMessage);
  const canSend = providerItems.length > EMAIL_LIMITS.emptyLength;

  const providerOptions: EmailSelectOption[] = providerItems.map((provider) => ({
    value: provider.id,
    label: provider.name,
  }));
  const templateOptions: EmailSelectOption[] = templateItems.map((template) => ({
    value: template.id,
    label: template.translations[EMAIL_LOCALES.fa]?.name ?? template.key,
  }));
  const localeOptions: EmailSelectOption[] = [
    { value: EMAIL_LOCALES.fa, label: t("options.fa") },
    { value: EMAIL_LOCALES.en, label: t("options.en") },
  ];

  function changeTemplate(value: string) {
    setTemplateId(value);
    const selected = templateItems.find((template) => template.id === value);
    setVariables(
      Object.fromEntries((selected?.variables ?? []).map((variable) => [variable, ""])),
    );
    setSubject(selected?.translations[locale]?.subject ?? "");
    setResult(null);
  }

  function resetForm() {
    setRecipientsText("");
    setSelectedUsers([]);
    setMessage("");
    setSubject("");
    setCampaignName("");
    setVariables({});
    setResult(null);
    setError(null);
  }

  function changeLocale(value: string) {
    setLocale(value as SendLocale);
  }

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!providerId || !canSend || recipients.length === EMAIL_LIMITS.emptyLength || !composedMessage.trim() || !subject.trim()) {
      setError(t("errors.required"));
      return;
    }
    if (
      mode === EMAIL_SEND_MODES.template &&
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
        ...(mode === EMAIL_SEND_MODES.template && templateId ? { templateId } : {}),
        messageType: selectedTemplate?.messageType ?? "transactional",
        contentFormat,
        recipients,
        subject: subject.trim(),
        ...(mode === EMAIL_SEND_MODES.custom ? { message: message.trim() } : {}),
        locale,
        ...(mode === EMAIL_SEND_MODES.template ? { variables } : {}),
        campaignName: campaignName.trim() || undefined,
      };
      const response = await fetch(EMAIL_API_ROUTES.messages, {
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
      const body = (await response.json()) as { data: EmailSendSummary };
      setResult(body.data);
      toast.success(t("summary.success"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("errors.server"));
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (step === 1 && recipients.length === EMAIL_LIMITS.emptyLength) {
      setError(t("errors.recipientsRequired"));
      return;
    }
    if (step === 2 && (!providerId || !canSend || !composedMessage.trim() || !subject.trim())) {
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
        ns="emailSend"
        steps={SEND_STEPS}
        backHref={EMAIL_DASHBOARD_ROUTES.root}
      />

      {!canSend ? (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-dash-heading font-black text-accent">{t("errors.noProvider")}</h2>
              <p className="mt-1 text-dash-body-sm text-content-secondary">{t("errors.noProvider")}</p>
            </div>
            <Link
              href={EMAIL_DASHBOARD_ROUTES.addProvider}
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
              <EmailRecipientPicker selected={selectedUsers} onChange={setSelectedUsers} />
              <Panel>
                <Field id="email-send-recipients" label={t("fields.recipients")} hint={t("fields.recipientsHint")} required>
                  <textarea id="email-send-recipients" dir="ltr" value={recipientsText} onChange={(event) => setRecipientsText(event.target.value)} className={`${inputClass(Boolean(error) && recipients.length === EMAIL_LIMITS.emptyLength)} min-h-36 resize-y py-3`} />
                </Field>
              </Panel>
            </div>
          )}
          {step === 2 && (
            <EmailSendFormFields
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
              subject={subject}
              selectedTemplate={selectedTemplate}
              selectedTranslation={selectedTranslation}
              variables={variables}
              error={error}
              onModeChange={setMode}
              onProviderChange={setProviderId}
              onTemplateChange={changeTemplate}
              onLocaleChange={changeLocale}
              onCampaignChange={setCampaignName}
              onRecipientsChange={setRecipientsText}
              onMessageChange={setMessage}
              onSubjectChange={setSubject}
              onVariableChange={(name, value) => setVariables((current) => ({ ...current, [name]: value }))}
              onClear={resetForm}
              showRecipients={false}
            />
          )}
          {step === 3 && (
            <EmailSendReview
              recipientCount={recipients.length}
              characters={length.characters}
              format={contentFormat}
              error={error}
              result={result}
              submitting={submitting}
            />
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
          ns="emailSend"
        />
      )}
    </div>
  );
}
