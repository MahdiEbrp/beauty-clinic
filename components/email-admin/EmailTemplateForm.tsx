"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import { EMAIL_API_ROUTES, EMAIL_DASHBOARD_ROUTES, EMAIL_LIMITS } from "@/lib/email/constants";
import type { AdminEmailTemplate } from "@/lib/email/template-service";
import { useRouter } from "@/src/i18n/navigation";
import {
  EmailTemplateContentStep,
  EmailTemplateDetailsStep,
  EmailTemplatePreviewStep,
} from "./EmailTemplateWizardSteps";
import { EmailTemplateReviewStep } from "./EmailTemplateReviewStep";
import { TEMPLATE_KEY_PATTERN, parseEmailVariables } from "./email-form-utils";
import type {
  EmailTemplateFormSetter,
  EmailTemplateFormState,
} from "./email-template-form-types";

const TEMPLATE_STEPS = [
  { id: 1, key: "details" },
  { id: 2, key: "content" },
  { id: 3, key: "preview" },
  { id: 4, key: "review" },
] as const;

function initialState(template?: AdminEmailTemplate): EmailTemplateFormState {
  return {
    key: template?.key ?? "",
    messageType: template?.messageType ?? "transactional",
    contentFormat: template?.contentFormat ?? "html",
    faName: template?.translations.fa?.name ?? "",
    faSubject: template?.translations.fa?.subject ?? "",
    faContent: template?.translations.fa?.content ?? "",
    enName: template?.translations.en?.name ?? "",
    enSubject: template?.translations.en?.subject ?? "",
    enContent: template?.translations.en?.content ?? "",
    variables: template?.variables.join(", ") ?? "",
    displayOrder: String(template?.displayOrder ?? EMAIL_LIMITS.zero),
    isActive: template?.isActive ?? true,
  };
}

export function EmailTemplateForm({
  template,
}: {
  template?: AdminEmailTemplate;
}) {
  const t = useTranslations("emailTemplateForm");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EmailTemplateFormState>(() => initialState(template));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue: EmailTemplateFormSetter = (key, value) =>
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
        !form.faSubject.trim() ||
        !form.faContent.trim() ||
        !form.enName.trim() ||
        !form.enSubject.trim() ||
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
        messageType: form.messageType,
        contentFormat: form.contentFormat,
        variables: parseEmailVariables(form.variables),
        translations: {
          fa: {
            name: form.faName.trim(),
            subject: form.faSubject.trim(),
            content: form.faContent.trim(),
          },
          en: {
            name: form.enName.trim(),
            subject: form.enSubject.trim(),
            content: form.enContent.trim(),
          },
        },
        displayOrder: Number(form.displayOrder) || EMAIL_LIMITS.zero,
        isActive: form.isActive,
      };
      const endpoint = template
        ? `${EMAIL_API_ROUTES.templates}/${template.id}`
        : EMAIL_API_ROUTES.templates;
      const response = await fetch(endpoint, {
        method: template ? "PATCH" : "POST",
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
      toast.success(t(template ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push(EMAIL_DASHBOARD_ROUTES.templates);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("errors.server"));
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
        ns="emailTemplateForm"
        steps={TEMPLATE_STEPS}
        backHref={EMAIL_DASHBOARD_ROUTES.templates}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <EmailTemplateDetailsStep
            form={form}
            setValue={setValue}
            locked={Boolean(template)}
          />
        )}
        {step === 2 && (
          <EmailTemplateContentStep form={form} setValue={setValue} />
        )}
        {step === 3 && (
          <EmailTemplatePreviewStep form={form} setValue={setValue} />
        )}
        {step === 4 && <EmailTemplateReviewStep form={form} />}
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
        ns="emailTemplateForm"
      />
    </div>
  );
}