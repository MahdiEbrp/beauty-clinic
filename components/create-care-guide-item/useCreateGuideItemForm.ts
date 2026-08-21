"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";

import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";
import { createCareGuideItemSchema } from "@/lib/validation/care-guides";

import { STEPS } from "./helpers";
import { seedFromItem } from "./initial-state";
import { buildItemPayload, submitItemRequest } from "./submit";
import type { FieldErrors, GuideOption, LangContent, Locale } from "./types";

export function useCreateGuideItemForm(
  initialItem?: AdminCareGuideItem,
  guideOptions: GuideOption[] = [],
  initialGuideId?: string,
) {
  const t = useTranslations("guideItemWizard");
  const router = useRouter();
  const mode: "create" | "edit" = initialItem ? "edit" : "create";
  const seed = initialItem ? seedFromItem(initialItem) : undefined;

  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Locale>("en");

  const [guideId, setGuideId] = useState(
    seed?.guideId ?? initialGuideId ?? guideOptions[0]?.id ?? "",
  );

  const [content, setContent] = useState<Record<Locale, LangContent>>(
    seed?.content ?? {
      en: { title: "", description: "" },
      fa: { title: "", description: "" },
    },
  );
  const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [highlighted, setHighlighted] = useState(seed?.highlighted ?? false);
  const [displayOrder, setDisplayOrder] = useState(seed?.displayOrder ?? "0");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStepKey = STEPS.find((s) => s.id === step)?.key ?? "guide";

  const currentContent = content[lang];

  const goTo = (next: number) => {
    if (next >= 1 && next <= STEPS.length) setStep(next);
  };

  const patchContent = (locale: Locale, patch: Partial<LangContent>) => {
    setContent((prev) =>
      locale === "en"
        ? { ...prev, en: { ...prev.en, ...patch } }
        : { ...prev, fa: { ...prev.fa, ...patch } },
    );
  };

  const setLangTitle = (value: string) => patchContent(lang, { title: value });
  const setLangDescription = (value: string) =>
    patchContent(lang, { description: value });

  const validateStep = (target: number): boolean => {
    const errors: FieldErrors = {};
    if (target === 1 && !guideId) {
      errors.guideId = t("errors.guideRequired");
    }
    if (target === 2) {
      if (!currentContent.title.trim()) {
        if (lang === "en") errors.enTitle = t("errors.titleRequired");
        else errors.faTitle = t("errors.titleRequired");
      }
    }
    if (target === 3) {
      if (!content.en.title.trim()) errors.enTitle = t("errors.titleRequired");
      if (!content.fa.title.trim()) errors.faTitle = t("errors.titleRequired");
    }
    setFieldErrors(errors);
    return Object.values(errors).length === 0;
  };

  const applyValidationToStep = (
    issues: Array<{ path: Array<string | number | symbol> }>,
  ) => {
    const errors: FieldErrors = {};
    let target = 4;
    for (const issue of issues) {
      const path = issue.path.map(String);
      if (path[0] === "guideId") {
        errors.guideId = t("errors.guideRequired");
        target = Math.min(target, 1);
      }
      if (path[0] === "translations" && path[1] === "title") {
        if (path[2] === "en") {
          errors.enTitle = t("errors.titleRequired");
          target = Math.min(target, 1);
        }
        if (path[2] === "fa") {
          errors.faTitle = t("errors.titleRequired");
          target = Math.min(target, 3);
        }
      }
    }
    setFieldErrors(errors);
    goTo(target);
    toast.error(t("errors.generic"));
  };

  const handleCreate = async () => {
    setServerError(null);
    const payload = buildItemPayload({
      guideId,
      content,
      isActive,
      highlighted,
      displayOrder,
    });
    const parsed = createCareGuideItemSchema.safeParse(payload);
    if (!parsed.success) {
      applyValidationToStep(parsed.error.issues);
      return;
    }

    setSubmitting(true);
    const pending = toast.loading(
      t(mode === "edit" ? "toast.saving" : "toast.creating"),
    );
    try {
      const result = await submitItemRequest({
        itemId: mode === "edit" ? initialItem?.id : undefined,
        payload: parsed.data,
      });
      if (!result.ok) {
        const message = result.message;
        setServerError(message ?? t("toast.error"));
        toast.error(t("toast.error"), { id: pending });
        return;
      }
      toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push("/dashboard/care/manage/items");
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
      void handleCreate();
      return;
    }
    setServerError(null);
    if (validateStep(step)) goTo(step + 1);
  };

  const selectedGuideName =
    guideOptions.find((option) => option.id === guideId)?.name ?? "";

  return {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    currentContent,
    content,
    guideId,
    setGuideId,
    guideOptions,
    selectedGuideName,
    isActive,
    setIsActive,
    highlighted,
    setHighlighted,
    displayOrder,
    setDisplayOrder,
    fieldErrors,
    serverError,
    submitting,
    setLangTitle,
    setLangDescription,
    handlePrimary,
  };
}
