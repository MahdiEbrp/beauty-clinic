"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Panel } from "@/components/create-group/ui";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import { PAYMENT_API_ROUTES, PAYMENT_DASHBOARD_ROUTES } from "@/lib/payment/constants";
import type { AdminPaymentProvider } from "@/lib/payment/provider-service";
import { getPaymentProviderOption } from "@/data/payment-providers";
import { useRouter } from "@/src/i18n/navigation";

import { PaymentProviderCredentialsFields } from "./PaymentProviderCredentialsFields";
import { PaymentProviderIdentityFields, updateProviderKind } from "./PaymentProviderIdentityFields";
import { PaymentProviderStatusFields } from "./PaymentProviderStatusFields";
import { PaymentProviderReview } from "./PaymentProviderReview";
import type { PaymentProviderFormState } from "./provider-form-types";

const PROVIDER_STEPS = [
  { id: 1, key: "identity" },
  { id: 2, key: "credentials" },
  { id: 3, key: "status" },
  { id: 4, key: "review" },
] as const;

export function PaymentProviderForm({ provider }: { provider?: AdminPaymentProvider }) {
  const t = useTranslations("paymentProviderForm");
  const router = useRouter();
  const initialKind = (provider?.kind as PaymentProviderFormState["kind"]) ?? "zarinpal";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PaymentProviderFormState>({
    name: provider?.name ?? "",
    kind: initialKind,
    apiUrl: provider?.apiUrl ?? getPaymentProviderOption(initialKind as any).defaultApiUrl,
    merchantId: "",
    callbackUrl: provider?.callbackUrl ?? "",
    sandbox: false,
    isActive: provider?.isActive ?? true,
    isDefault: provider?.isDefault ?? false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue = <K extends keyof PaymentProviderFormState>(key: K, value: PaymentProviderFormState[K]) =>
    setForm((c) => ({ ...c, [key]: value }));

  const validateStep = (target: number) => {
    if (target === 1 && (!form.name.trim() || !form.apiUrl.trim())) {
      setServerError(t("errors.required"));
      return false;
    }
    if (target === 2 && !provider && !form.merchantId.trim()) {
      setServerError(t("errors.merchantRequired"));
      return false;
    }
    setServerError(null);
    return true;
  };

  async function submit() {
    setServerError(null);
    if (!validateStep(1) || (!provider && !validateStep(2))) return;
    setSubmitting(true);
    const pending = toast.loading(t(provider ? "toast.saving" : "toast.creating"));
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        kind: form.kind,
        apiUrl: form.apiUrl.trim(),
        callbackUrl: form.callbackUrl.trim() || undefined,
        sandbox: form.sandbox,
        isActive: form.isActive,
        isDefault: form.isDefault,
      };
      if (form.merchantId.trim()) payload.merchantId = form.merchantId.trim();
      const endpoint = provider ? `${PAYMENT_API_ROUTES.providers}/${provider.id}` : PAYMENT_API_ROUTES.providers;
      const response = await fetch(endpoint, {
        method: provider ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? t("errors.server"));
      }
      toast.success(t(provider ? "toast.updated" : "toast.created"), { id: pending });
      router.push(PAYMENT_DASHBOARD_ROUTES.providers);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("errors.server"));
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  }

  const goNext = () => {
    if (step < PROVIDER_STEPS.length && validateStep(step)) setStep((c) => c + 1);
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
        ns="paymentProviderForm"
        steps={PROVIDER_STEPS}
        backHref={PAYMENT_DASHBOARD_ROUTES.providers}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <Panel>
            <div className="mb-6">
              <h2 className="text-dash-heading font-bold text-content-primary">{t("sections.identity")}</h2>
              <p className="mt-1 text-dash-body-sm text-content-secondary">{t("sections.identityHint")}</p>
            </div>
            <PaymentProviderIdentityFields form={form} provider={provider} setValue={setValue} setKind={(k) => setForm((c) => updateProviderKind(c, k as any))} />
          </Panel>
        )}
        {step === 2 && (
          <Panel>
            <h2 className="text-dash-heading font-bold text-content-primary">{t("sections.credentials")}</h2>
            <p className="mt-1 text-dash-body-sm text-content-secondary">{t("sections.credentialsHint")}</p>
            <PaymentProviderCredentialsFields form={form} setValue={setValue} isEdit={Boolean(provider)} />
          </Panel>
        )}
        {step === 3 && (
          <Panel>
            <h2 className="text-dash-heading font-bold text-content-primary">{t("sections.status")}</h2>
            <p className="mt-1 text-dash-body-sm text-content-secondary">{t("sections.statusHint")}</p>
            <PaymentProviderStatusFields form={form} setValue={setValue} />
          </Panel>
        )}
        {step === 4 && <PaymentProviderReview form={form} />}
        {serverError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error">
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
        onBack={() => setStep((c) => Math.max(1, c - 1))}
        onPrimary={() => {
          if (step === PROVIDER_STEPS.length) void submit();
          else goNext();
        }}
        ns="paymentProviderForm"
      />
    </div>
  );
}
