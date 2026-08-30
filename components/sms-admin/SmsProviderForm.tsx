"use client";

import { AlertTriangle, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SMS_API_ROUTES, SMS_DASHBOARD_ROUTES, SMS_PROVIDER_DEFAULTS } from "@/lib/sms/constants";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import { getSmsProviderOption } from "@/data/sms-providers";
import { useRouter } from "@/src/i18n/navigation";
import { Panel } from "@/components/create-group/ui";
import { SmsBackLink } from "./common";
import { SmsProviderCredentialsFields } from "./SmsProviderCredentialsFields";
import { SmsProviderIdentityFields, updateProviderKind } from "./SmsProviderIdentityFields";
import { SmsProviderStatusFields } from "./SmsProviderStatusFields";
import type { SmsProviderFormState } from "./provider-form-types";

export function SmsProviderForm({ provider }: { provider?: AdminSmsProvider }) {
  const t = useTranslations("smsProviderForm");
  const smsT = useTranslations("smsAdmin");
  const router = useRouter();
  const initialKind = provider?.kind ?? "kavenegar";
  const [form, setForm] = useState<SmsProviderFormState>({
    name: provider?.name ?? "",
    kind: initialKind,
    apiUrl: provider?.apiUrl ?? getSmsProviderOption(initialKind).defaultApiUrl,
    token: "",
    sender: provider?.sender ?? "",
    authScheme: provider?.credentials.authScheme ?? SMS_PROVIDER_DEFAULTS.authScheme,
    authHeader: SMS_PROVIDER_DEFAULTS.authHeader,
    lineNumber: provider?.credentials.lineNumber ?? "",
    payloadMode: provider?.credentials.payloadMode ?? SMS_PROVIDER_DEFAULTS.payloadMode,
    username: "",
    password: "",
    apiKey: "",
    isActive: provider?.isActive ?? true,
    isDefault: provider?.isDefault ?? false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const option = getSmsProviderOption(form.kind);

  const setValue = <K extends keyof SmsProviderFormState>(
    key: K,
    value: SmsProviderFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    if (!form.name.trim() || !form.apiUrl.trim() || (!provider && !form.token.trim())) {
      setServerError(t("errors.required"));
      return;
    }
    setSubmitting(true);
    try {
      const credentials = Object.fromEntries(
        Object.entries({
          authScheme: form.authScheme,
          authHeader: form.authHeader.trim(),
          lineNumber: form.lineNumber.trim(),
          payloadMode: form.payloadMode,
          username: form.username.trim(),
          password: form.password,
          apiKey: form.apiKey.trim(),
        }).filter(([, value]) => value !== ""),
      );
      const payload = {
        name: form.name.trim(),
        kind: form.kind,
        apiUrl: form.apiUrl.trim(),
        ...(form.token.trim() ? { token: form.token.trim() } : {}),
        credentials,
        sender: form.sender.trim() || undefined,
        isActive: form.isActive,
        isDefault: form.isDefault,
      };
      const endpoint = provider
        ? `${SMS_API_ROUTES.providers}/${provider.id}`
        : SMS_API_ROUTES.providers;
      const response = await fetch(endpoint, {
        method: provider ? "PATCH" : "POST",
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
      toast.success(provider ? t("toast.updated") : t("toast.created"));
      router.push(SMS_DASHBOARD_ROUTES.providers);
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
        <SmsBackLink href={SMS_DASHBOARD_ROUTES.providers} />
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-card bg-copper/15 text-copper-strong">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-dash-display font-black tracking-tight text-accent">
              {provider ? t("editHeading") : t("heading")}
            </h1>
            <p className="mt-1 max-w-2xl text-dash-body leading-7 text-content-secondary">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <Panel>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-copper-strong" aria-hidden="true" />
          <div>
            <h2 className="text-dash-heading font-black text-accent">{t("sections.identity")}</h2>
            <p className="mt-1 text-dash-body-sm text-content-secondary">
              {smsT(option.descriptionKey as never)}
            </p>
          </div>
        </div>
        <SmsProviderIdentityFields
          form={form}
          provider={provider}
          setValue={setValue}
          setKind={(kind) => setForm((current) => updateProviderKind(current, kind))}
        />
      </Panel>

      <Panel>
        <h2 className="text-dash-heading font-black text-accent">{t("sections.credentials")}</h2>
        <SmsProviderCredentialsFields form={form} setValue={setValue} />
      </Panel>

      <Panel>
        <h2 className="text-dash-heading font-black text-accent">{t("sections.status")}</h2>
        <SmsProviderStatusFields form={form} setValue={setValue} />
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
          onClick={() => router.push(SMS_DASHBOARD_ROUTES.providers)}
          className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-interactive px-5 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? t("actions.saving") : provider ? t("actions.update") : t("actions.create")}
          <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
