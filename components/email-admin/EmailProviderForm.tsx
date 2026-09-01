"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Panel } from "@/components/create-group/ui";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import {
  EMAIL_API_ROUTES,
  EMAIL_DASHBOARD_ROUTES,
  EMAIL_LIMITS,
} from "@/lib/email/constants";
import type { AdminEmailProvider } from "@/lib/email/provider-service";
import { getEmailProviderOption } from "@/data/email-providers";
import { useRouter } from "@/src/i18n/navigation";
import {
  EmailProviderCredentialsFields,
} from "./EmailProviderCredentialsFields";
import {
  EmailProviderIdentityFields,
  updateProviderKind,
} from "./EmailProviderIdentityFields";
import { EmailProviderStatusFields } from "./EmailProviderStatusFields";
import { EmailProviderReview } from "./EmailProviderReview";
import type { EmailProviderFormState } from "./email-provider-form-types";

const PROVIDER_STEPS = [
  { id: 1, key: "identity" },
  { id: 2, key: "credentials" },
  { id: 3, key: "status" },
  { id: 4, key: "review" },
] as const;

export function EmailProviderForm({
  provider,
}: {
  provider?: AdminEmailProvider;
}) {
  const t = useTranslations("emailProviderForm");
  const router = useRouter();
  const initialKind = provider?.kind ?? "custom";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EmailProviderFormState>({
    name: provider?.name ?? "",
    kind: initialKind,
    host: provider?.host ?? getEmailProviderOption(initialKind).defaultHost,
    port: provider?.port
      ? String(provider.port)
      : String(getEmailProviderOption(initialKind).defaultPort),
    encryption:
      provider?.encryption ?? getEmailProviderOption(initialKind).defaultEncryption,
    username: "",
    password: "",
    fromEmail: provider?.fromEmail ?? "",
    fromName: provider?.fromName ?? "",
    isActive: provider?.isActive ?? true,
    isDefault: provider?.isDefault ?? false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue = <K extends keyof EmailProviderFormState>(
    key: K,
    value: EmailProviderFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const validateStep = (target: number) => {
    const port = Number(form.port);
    const portValid =
      Number.isInteger(port) &&
      port >= EMAIL_LIMITS.providerPortMin &&
      port <= EMAIL_LIMITS.providerPortMax;
    if (target === 1 && (!form.name.trim() || !form.host.trim())) {
      setServerError(t("errors.required"));
      return false;
    }
    if (target === 1 && (!form.port.trim() || !portValid)) {
      setServerError(t("errors.invalidPort"));
      return false;
    }
    if (target === 2 && !provider && !form.password.trim()) {
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
      const payload = {
        name: form.name.trim(),
        kind: form.kind,
        host: form.host.trim(),
        port: Number(form.port),
        encryption: form.encryption,
        ...(form.username.trim() ? { username: form.username.trim() } : {}),
        ...(form.password ? { password: form.password } : {}),
        fromEmail: form.fromEmail.trim() || undefined,
        fromName: form.fromName.trim() || undefined,
        isActive: form.isActive,
        isDefault: form.isDefault,
      };
      const endpoint = provider
        ? `${EMAIL_API_ROUTES.providers}/${provider.id}`
        : EMAIL_API_ROUTES.providers;
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
      router.push(EMAIL_DASHBOARD_ROUTES.providers);
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
        ns="emailProviderForm"
        steps={PROVIDER_STEPS}
        backHref={EMAIL_DASHBOARD_ROUTES.providers}
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
            <EmailProviderIdentityFields
              form={form}
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
            <EmailProviderCredentialsFields
              form={form}
              provider={provider}
              setValue={setValue}
            />
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
            <EmailProviderStatusFields form={form} setValue={setValue} />
          </Panel>
        )}
        {step === 4 && <EmailProviderReview form={form} />}
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
        ns="emailProviderForm"
      />
    </div>
  );
}