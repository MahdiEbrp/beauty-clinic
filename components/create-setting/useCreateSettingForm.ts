"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { AdminSetting } from "@/lib/settings/admin";
import { KEY_PATTERN, STEPS } from "./helpers";
import { emptySeed, seedFromSetting } from "./initial-state";
import { submitSettingRequest } from "./submit";
import type { FieldErrors, Locale, SettingType } from "./types";

export function useCreateSettingForm(initialSetting?: AdminSetting) {
  const t = useTranslations("settingWizard");
  const router = useRouter();
  const mode: "create" | "edit" = initialSetting ? "edit" : "create";
  const seed = initialSetting ? seedFromSetting(initialSetting) : emptySeed();

  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<Locale>("fa");
  const [key, setKey] = useState(seed.key);
  const [type, setType] = useState<SettingType>((seed.type as SettingType) ?? "string");
  const [stringValue, setStringValue] = useState(seed.stringValue);
  const [numberValue, setNumberValue] = useState(seed.numberValue);
  const [booleanValue, setBooleanValue] = useState(seed.booleanValue);
  const [jsonValue, setJsonValue] = useState(seed.jsonValue);
  const [faValue, setFaValue] = useState(seed.faValue);
  const [enValue, setEnValue] = useState(seed.enValue);
  const [displayOrder, setDisplayOrder] = useState(seed.displayOrder);
  const [isActive, setIsActive] = useState(seed.isActive);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goTo = (next: number) => {
    if (next >= 1 && next <= STEPS.length) setStep(next);
  };

  const currentStepKey = STEPS.find((s) => s.id === step)?.key ?? "identity";
  const currentValue = lang === "fa" ? faValue : enValue;
  const setCurrentValue = (value: string) => {
    if (lang === "fa") setFaValue(value);
    else setEnValue(value);
  };

  function validateStep(current: number): boolean {
    const errors: FieldErrors = {};
    if (current === 1 && mode === "create" && !KEY_PATTERN.test(key.trim())) {
      errors.key = t("errors.keyInvalid");
    }
    if (current === 2) {
      if (type === "string" && !stringValue.trim()) errors.value = t("errors.valueRequired");
      if (type === "number") {
        const n = Number(numberValue);
        if (numberValue.trim() === "" || !Number.isFinite(n)) errors.value = t("errors.numberInvalid");
      }
      if (type === "object" || type === "array") {
        if (!jsonValue.trim()) {
          errors.value = t("errors.valueRequired");
        } else {
          try {
            JSON.parse(jsonValue);
          } catch {
            errors.value = t("errors.jsonInvalid");
          }
        }
      }
      if (type === "localized") {
        if (!faValue.trim() && !enValue.trim()) {
          errors.faValue = t("errors.localizedRequired");
          errors.enValue = t("errors.localizedRequired");
        }
      }
    }
    if (current === 3 && (displayOrder.trim() === "" || !/^\d+$/.test(displayOrder))) {
      errors.displayOrder = t("errors.orderInvalid");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildPayload() {
    // The update schema is strict and rejects "type" — it's immutable after
    // creation, so only send it on create. Edit PATCHes omit it entirely.
    const base = {
      ...(mode === "create" ? { type } : {}),
      isActive,
      displayOrder: Number(displayOrder) || 0,
    };
    if (type === "localized") {
      return {
        ...base,
        translations: {
          ...(faValue.trim() ? { fa: faValue.trim() } : {}),
          ...(enValue.trim() ? { en: enValue.trim() } : {}),
        },
      };
    }
    let value: unknown;
    if (type === "string") value = stringValue.trim();
    if (type === "number") value = Number(numberValue);
    if (type === "boolean") value = booleanValue;
    if (type === "object" || type === "array") value = JSON.parse(jsonValue) as unknown;
    return { ...base, value };
  }

  const handleSubmit = async () => {
    setServerError(null);
    const payload = buildPayload();
    if (mode === "create") {
      const full = { ...payload, key: key.trim() };
      setSubmitting(true);
      const pending = toast.loading(t("toast.creating"));
      try {
        const result = await submitSettingRequest({ payload: full });
        if (!result.ok) {
          if (result.kind === "key-taken") {
            setFieldErrors((prev) => ({ ...prev, key: t("errors.keyTaken") }));
            goTo(1);
            toast.error(t("errors.keyTaken"), { id: pending });
          } else {
            setServerError(result.message ?? t("toast.error"));
            toast.error(t("toast.error"), { id: pending });
          }
          return;
        }
        toast.success(t("toast.created"), { id: pending });
        router.push("/dashboard/settings");
        router.refresh();
      } catch {
        setServerError(t("toast.error"));
        toast.error(t("toast.error"), { id: pending });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const id = initialSetting?.id;
    if (!id) return;
    setSubmitting(true);
    const pending = toast.loading(t("toast.saving"));
    try {
      const result = await submitSettingRequest({ settingId: id, payload });
      if (!result.ok) {
        const msg = result.kind === "server" ? result.message : t("toast.keyTaken");
        setServerError(msg ?? t("toast.error"));
        toast.error(t("toast.error"), { id: pending });
        return;
      }
      toast.success(t("toast.updated"), { id: pending });
      router.push("/dashboard/settings");
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
    key,
    setKey,
    type,
    setType,
    stringValue,
    setStringValue,
    numberValue,
    setNumberValue,
    booleanValue,
    setBooleanValue,
    jsonValue,
    setJsonValue,
    faValue,
    setFaValue,
    enValue,
    setEnValue,
    currentValue,
    setCurrentValue,
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