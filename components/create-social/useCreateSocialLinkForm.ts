"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { AdminSocialLink } from "@/lib/social/admin";
import { STEPS, URL_PATTERN } from "./helpers";
import { emptySeed, seedFromLink } from "./initial-state";
import { submitSocialLinkRequest } from "./submit";
import type { FieldErrors, Locale } from "./types";

export function useCreateSocialLinkForm(initialLink?: AdminSocialLink) {
  const t = useTranslations("socialWizard");
  const router = useRouter();
  const mode: "create" | "edit" = initialLink ? "edit" : "create";
  const seed = initialLink ? seedFromLink(initialLink) : emptySeed();

  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<Locale>("fa");
  const [url, setUrl] = useState(seed.url);
  const [imageUrl, setImageUrl] = useState(seed.imageUrl);
  const [labelFa, setLabelFa] = useState(seed.labelFa);
  const [labelEn, setLabelEn] = useState(seed.labelEn);
  const [displayOrder, setDisplayOrder] = useState(seed.displayOrder);
  const [isActive, setIsActive] = useState(seed.isActive);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goTo = (next: number) => {
    if (next >= 1 && next <= STEPS.length) setStep(next);
  };

  const currentStepKey = STEPS.find((s) => s.id === step)?.key ?? "identity";

  function validateStep(current: number): boolean {
    const errors: FieldErrors = {};
    if (current === 1) {
      if (!URL_PATTERN.test(url.trim())) errors.url = t("errors.urlInvalid");
      if (!labelFa.trim()) errors.labelFa = t("errors.labelRequired");
      if (!labelEn.trim()) errors.labelEn = t("errors.labelRequired");
      if (imageUrl.trim() && !URL_PATTERN.test(imageUrl.trim())) {
        errors.imageUrl = t("errors.urlInvalid");
      }
    }
    if (current === 2 && (displayOrder.trim() === "" || !/^\d+$/.test(displayOrder))) {
      errors.displayOrder = t("errors.orderInvalid");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const buildPayload = () => ({
    url: url.trim(),
    imageUrl: imageUrl.trim() || undefined,
    labelFa: labelFa.trim(),
    labelEn: labelEn.trim(),
    displayOrder: Number(displayOrder) || 0,
    isActive,
  });

  const handleSubmit = async () => {
    setServerError(null);
    const payload = buildPayload();
    setSubmitting(true);
    const pending = toast.loading(mode === "edit" ? t("toast.saving") : t("toast.creating"));
    try {
      const result = await submitSocialLinkRequest({
        linkId: mode === "edit" ? initialLink?.id : undefined,
        payload,
      });
      if (!result.ok) {
        setServerError(result.message ?? t("toast.error"));
        toast.error(t("toast.error"), { id: pending });
        return;
      }
      toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"), { id: pending });
      router.push("/dashboard/settings/social");
      router.refresh();
    } catch {
      setServerError(t("toast.error"));
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimary = () => {
    if (step === STEPS.length) {
      void handleSubmit();
      return;
    }
    if (!validateStep(step)) return;
    setServerError(null);
    goTo(step + 1);
  };

  return {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    url,
    setUrl,
    imageUrl,
    setImageUrl,
    labelFa,
    setLabelFa,
    labelEn,
    setLabelEn,
    displayOrder,
    setDisplayOrder,
    isActive,
    setIsActive,
    fieldErrors,
    serverError,
    submitting,
    handlePrimary,
  };
}