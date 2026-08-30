"use client";

import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Panel } from "@/components/create-group/ui";
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
import { Link } from "@/src/i18n/navigation";
import {
  SmsBackLink,
  SmsStatusBadge,
  SmsSubnav,
  type SmsSelectOption,
} from "./common";
import { parseSmsRecipients } from "./form-utils";
import { SmsSendFormFields, type SmsComposeMode } from "./SmsSendFormFields";

type SendMode = SmsComposeMode;
type SendLocale = (typeof SMS_LOCALES)[keyof typeof SMS_LOCALES];

export function SmsSendContent({
  providerItems,
  templateItems,
}: {
  providerItems: AdminSmsProvider[];
  templateItems: AdminSmsTemplate[];
}) {
  const t = useTranslations("smsSend");
  const [mode, setMode] = useState<SendMode>(SMS_SEND_MODES.custom);
  const [providerId, setProviderId] = useState(providerItems[0]?.id ?? "");
  const [templateId, setTemplateId] = useState("");
  const [locale, setLocale] = useState<SendLocale>(SMS_LOCALES.fa);
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
  const recipients = useMemo(() => parseSmsRecipients(recipientsText), [recipientsText]);
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <SmsSubnav canSend canWrite={false} />
      <header className="space-y-3">
        <SmsBackLink href={SMS_DASHBOARD_ROUTES.root} />
        <h1 className="text-dash-display font-black tracking-tight text-accent">{t("heading")}</h1>
        <p className="max-w-2xl text-dash-body leading-7 text-content-secondary">{t("description")}</p>
      </header>

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
        <form onSubmit={(event) => void submit(event)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
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
            />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Panel>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-copper-strong" aria-hidden="true" />
                <h2 className="text-dash-heading font-black text-accent">{t("summary.ready")}</h2>
              </div>
              <dl className="mt-5 grid gap-4 text-dash-body-sm">
                <SummaryItem label={t("summary.recipients")} value={String(recipients.length)} />
                <SummaryItem label={t("summary.characters")} value={String(length.characters)} />
                <SummaryItem label={t("summary.parts")} value={String(length.parts)} />
                <SummaryItem
                  label={t("summary.encoding")}
                  value={length.encoding === "gsm7" ? t("summary.gsm7") : t("summary.unicode")}
                />
              </dl>
              {error && (
                <div role="alert" className="mt-5 flex items-start gap-2 rounded-control border border-error/30 bg-error/10 p-3 text-dash-caption text-error">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="wrap-break-word">{error}</span>
                </div>
              )}
              {result && (
                <div className="mt-5 space-y-1 rounded-control border border-success/30 bg-success/10 p-3 text-dash-caption text-success">
                  <p>{t("summary.sent", { sent: result.sent, total: result.total })}</p>
                  {result.failed > SMS_LIMITS.emptyLength && (
                    <p>{t("summary.failed", { failed: result.failed })}</p>
                  )}
                  <SmsStatusBadge status={result.status} />
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60"
              >
                <Send className="size-4" aria-hidden="true" />
                {submitting ? t("actions.sending") : t("actions.send")}
              </button>
            </Panel>
          </aside>
        </form>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-primary pb-3 last:border-b-0 last:pb-0">
      <dt className="text-content-secondary">{label}</dt>
      <dd dir="ltr" className="font-bold text-accent">{value}</dd>
    </div>
  );
}
