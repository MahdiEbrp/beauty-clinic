"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import { SMS_API_ROUTES, SMS_DASHBOARD_ROUTES, SMS_LIMITS } from "@/lib/sms/constants";
import { smsAdminErrorKey } from "@/lib/sms/error-messages";
import type { AdminSmsTemplate } from "@/lib/sms/template-service";
import { asTranslate } from "@/src/i18n/message-key";
import { useRouter } from "@/src/i18n/navigation";
import {
  SmsTemplateContentStep,
  SmsTemplateDetailsStep,
  SmsTemplatePreviewStep,
} from "./SmsTemplateWizardSteps";
import { SmsTemplateReviewStep } from "./SmsTemplateReviewStep";
import { TEMPLATE_KEY_PATTERN, parseSmsVariables } from "./form-utils";
import type {
  SmsTemplateFormSetter,
  SmsTemplateFormState,
} from "./sms-template-form-types";

const TEMPLATE_STEPS = [
  { id: 1, key: "details" },
  { id: 2, key: "content" },
  { id: 3, key: "preview" },
  { id: 4, key: "review" },
] as const;

function initialState(template?: AdminSmsTemplate): SmsTemplateFormState {
  return {
    key: template?.key ?? "",
    externalTemplateId: template?.externalTemplateId ?? "",
    messageType: template?.messageType ?? "transactional",
    faName: template?.translations.fa?.name ?? "",
    faContent: template?.translations.fa?.content ?? "",
    enName: template?.translations.en?.name ?? "",
    enContent: template?.translations.en?.content ?? "",
    variables: template?.variables.join(", ") ?? "",
    displayOrder: String(template?.displayOrder ?? SMS_LIMITS.zero),
    isActive: template?.isActive ?? true,
  };
}

export function SmsTemplateForm({
  template,
}: {
  template?: AdminSmsTemplate;
  canSend?: boolean;
}) {
  const t = useTranslations("smsTemplateForm");
  const adminErrorT = asTranslate(useTranslations("smsAdmin.errors"));
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SmsTemplateFormState>(() => initialState(template));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue: SmsTemplateFormSetter = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const validateStep = (target: number) => {
    if (
      target === 1 &&
      (!form.key.trim() || (!template && !TEMPLATE_KEY_PATTERN.test(form.key.trim())))
    ) {
      setServerError(t("errors.keyInvalid"));
      return false;
    }
    if (
      target === 2 &&
      (!form.faName.trim() ||
        !form.faContent.trim() ||
        !form.enName.trim() ||
        !form.enContent.trim())
    ) {
      setServerError(t("errors.required"));
      return false;
    }
    setServerError(null);
    return true;
  };

  async function submit() {
    setServerError(null);
    if (!validateStep(1) || !validateStep(2)) return;
    setSubmitting(true);
    const pending = toast.loading(
      t(template ? "toast.saving" : "toast.creating"),
    );
    try {
      const payload = {
        ...(template ? {} : { key: form.key.trim() }),
        externalTemplateId: form.externalTemplateId.trim() || undefined,
        messageType: form.messageType,
        variables: parseSmsVariables(form.variables),
        translations: {
          fa: { name: form.faName.trim(), content: form.faContent.trim() },
          en: { name: form.enName.trim(), content: form.enContent.trim() },
        },
        displayOrder: Number(form.displayOrder) || SMS_LIMITS.zero,
        isActive: form.isActive,
      };
      const endpoint = template
        ? `${SMS_API_ROUTES.templates}/${template.id}`
        : SMS_API_ROUTES.templates;
      const response = await fetch(endpoint, {
        method: template ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { code?: string; message?: string };
        } | null;
        const code = body?.error?.code;
        const fallback = body?.error?.message ?? t("errors.server");
        throw Object.assign(new Error(fallback), { code });
      }
      toast.success(t(template ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push(SMS_DASHBOARD_ROUTES.templates);
      router.refresh();
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const key = code ? smsAdminErrorKey({ code }) : "errors.server";
      setServerError(
        key === "errors.server"
          ? t("errors.server")
          : adminErrorT(key, { fallback: t("errors.server") }),
      );
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  }

  const goNext = () => {
    if (step < TEMPLATE_STEPS.length && validateStep(step)) {
      setStep((current) => current + 1);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={TEMPLATE_STEPS[step - 1]?.key ?? "details"}
        total={TEMPLATE_STEPS.length}
        lang="en"
        langAware={false}
        heading={template ? t("editHeading") : t("heading")}
        subtitle={t("description")}
        onLangChange={() => undefined}
        onGoTo={(next) => {
          if (next <= step || validateStep(step)) setStep(next);
        }}
        ns="smsTemplateForm"
        steps={TEMPLATE_STEPS}
        backHref={SMS_DASHBOARD_ROUTES.templates}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <SmsTemplateDetailsStep
            form={form}
            setValue={setValue}
            locked={Boolean(template)}
          />
        )}
        {step === 2 && (
          <SmsTemplateContentStep form={form} setValue={setValue} />
        )}
        {step === 3 && (
          <SmsTemplatePreviewStep form={form} setValue={setValue} />
        )}
        {step === 4 && <SmsTemplateReviewStep form={form} />}
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
        total={TEMPLATE_STEPS.length}
        submitting={submitting}
        submitLabel={template ? t("nav.save") : undefined}
        onBack={() => setStep((current) => Math.max(1, current - 1))}
        onPrimary={() => {
          if (step === TEMPLATE_STEPS.length) void submit();
          else goNext();
        }}
        ns="smsTemplateForm"
      />
    </div>
  );
}
