"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Panel } from "@/components/create-group/ui";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import { SMS_API_ROUTES, SMS_DASHBOARD_ROUTES, SMS_PROVIDER_DEFAULTS } from "@/lib/sms/constants";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import {
  getSmsProviderDefaultAuthScheme,
  getSmsProviderOption,
} from "@/data/sms-providers";
import { useRouter } from "@/src/i18n/navigation";
import {
  SmsProviderCredentialsFields,
} from "./SmsProviderCredentialsFields";
import {
  SmsProviderIdentityFields,
  updateProviderKind,
} from "./SmsProviderIdentityFields";
import { SmsProviderStatusFields } from "./SmsProviderStatusFields";
import { SmsProviderReview } from "./SmsProviderReview";
import type { SmsProviderFormState } from "./provider-form-types";

const PROVIDER_STEPS = [
  { id: 1, key: "identity" },
  { id: 2, key: "credentials" },
  { id: 3, key: "status" },
  { id: 4, key: "review" },
] as const;

export function SmsProviderForm({
  provider,
}: {
  provider?: AdminSmsProvider;
  canSend?: boolean;
}) {
  const t = useTranslations("smsProviderForm");
  const router = useRouter();
  const initialKind = provider?.kind ?? "kavenegar";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SmsProviderFormState>({
    name: provider?.name ?? "",
    kind: initialKind,
    apiUrl: provider?.apiUrl ?? getSmsProviderOption(initialKind).defaultApiUrl,
    token: "",
    sender: provider?.sender ?? "",
    authScheme:
      provider?.credentials.authScheme ??
      getSmsProviderDefaultAuthScheme(initialKind),
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

  const setValue = <K extends keyof SmsProviderFormState>(
    key: K,
    value: SmsProviderFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const validateStep = (target: number) => {
    if (target === 1 && (!form.name.trim() || !form.apiUrl.trim())) {
      setServerError(t("errors.required"));
      return false;
    }
    if (target === 2 && !provider && !form.token.trim()) {
      setServerError(t("errors.required"));
      return false;
    }
    setServerError(null);
    return true;
  };

  async function submit() {
    setServerError(null);
    if (!validateStep(1) || (!provider && !validateStep(2))) return;
    setSubmitting(true);
    const pending = toast.loading(
      t(provider ? "toast.saving" : "toast.creating"),
    );
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
      toast.success(t(provider ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push(SMS_DASHBOARD_ROUTES.providers);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errors.server");
      setServerError(message);
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  }

  const goNext = () => {
    if (step < PROVIDER_STEPS.length && validateStep(step)) {
      setStep((current) => current + 1);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={PROVIDER_STEPS[step - 1]?.key ?? "identity"}
        total={PROVIDER_STEPS.length}
        lang="en"
        langAware={false}
        heading={provider ? t("editHeading") : t("heading")}
        subtitle={t("description")}
        onLangChange={() => undefined}
        onGoTo={(next) => {
          if (next <= step || validateStep(step)) setStep(next);
        }}
        ns="smsProviderForm"
        steps={PROVIDER_STEPS}
        backHref={SMS_DASHBOARD_ROUTES.providers}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <Panel>
            <div className="mb-6">
              <h2 className="text-dash-heading font-bold text-content-primary">
                {t("sections.identity")}
              </h2>
              <p className="mt-1 text-dash-body-sm text-content-secondary">
                {t("sections.identityHint")}
              </p>
            </div>
            <SmsProviderIdentityFields
              form={form}
              provider={provider}
              setValue={setValue}
              setKind={(kind) =>
                setForm((current) => updateProviderKind(current, kind))
              }
            />
          </Panel>
        )}
        {step === 2 && (
          <Panel>
            <h2 className="text-dash-heading font-bold text-content-primary">
              {t("sections.credentials")}
            </h2>
            <p className="mt-1 text-dash-body-sm text-content-secondary">
              {t("sections.credentialsHint")}
            </p>
            <SmsProviderCredentialsFields form={form} setValue={setValue} />
          </Panel>
        )}
        {step === 3 && (
          <Panel>
            <h2 className="text-dash-heading font-bold text-content-primary">
              {t("sections.status")}
            </h2>
            <p className="mt-1 text-dash-body-sm text-content-secondary">
              {t("sections.statusHint")}
            </p>
            <SmsProviderStatusFields form={form} setValue={setValue} />
          </Panel>
        )}
        {step === 4 && <SmsProviderReview form={form} />}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="wrap-break-word">{serverError}</span>
          </div>
        )}
      </div>

      <WizardActionBar
        step={step}
        total={PROVIDER_STEPS.length}
        submitting={submitting}
        submitLabel={provider ? t("nav.save") : undefined}
        onBack={() => setStep((current) => Math.max(1, current - 1))}
        onPrimary={() => {
          if (step === PROVIDER_STEPS.length) void submit();
          else goNext();
        }}
        ns="smsProviderForm"
      />
    </div>
  );
}
