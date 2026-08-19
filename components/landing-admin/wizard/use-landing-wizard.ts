"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import { submitItemRequest } from "../forms/submit-item";
import { CONTENT_FIELDS, STEPS } from "./steps";
import type { FieldErrors, WizardLangContent } from "./types";
import type { CollectionKey } from "../types";

const LOCALES: Locale[] = ["fa", "en"];

function emptyContent(fields: { key: string }[]): WizardLangContent {
  const content: WizardLangContent = { fa: {}, en: {} };
  for (const field of fields) {
    content.fa[field.key] = "";
    content.en[field.key] = "";
  }
  return content;
}

export function useLandingWizard({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const mode: "create" | "edit" = initial ? "edit" : "create";

  const seedContentValue = (() => {
    if (!initial) {
      
      return emptyContent(CONTENT_FIELDS[collection]);
    }
    const tr = (initial as { translations?: Record<Locale, Record<string, string | null>> })
      .translations;
    
    const content = emptyContent(CONTENT_FIELDS[collection]);
    if (!tr) return content;
    
    for (const field of CONTENT_FIELDS[collection]) {
      for (const locale of LOCALES) {
        
        const value = tr[locale]?.[field.key];
        
        content[locale][field.key] = value ?? "";
      }
    }
    return content;
  })();

  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Locale>("fa");
  const [content, setContent] = useState<WizardLangContent>(seedContentValue);
  const [iconKey, setIconKey] = useState(
    initial && "icon" in initial ? initial.icon ?? "" : "",
  );
  const [imageUrl, setImageUrl] = useState(
    initial && "imageUrl" in initial
      ? initial.imageUrl
      : initial && "image" in initial
        ? initial.image ?? ""
        : "",
  );
  const [value, setValue] = useState(
    initial && "value" in initial ? String(initial.value) : "",
  );
  const [compact, setCompact] = useState(
    initial && "compact" in initial ? initial.compact : false,
  );
  const [plus, setPlus] = useState(
    initial && "plus" in initial ? initial.plus : false,
  );
  const [displayOrder, setDisplayOrder] = useState(
    initial ? String(initial.displayOrder) : "0",
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backHref = `/dashboard/landing/${collection}`;
  const currentStepKey = STEPS.find((s) => s.id === step)?.key ?? "content";

  const goTo = (next: number) => {
    if (next >= 1 && next <= STEPS.length) setStep(next);
  };

  const setField = (locale: Locale, key: string, next: string) => {
    setContent((prev) => ({
      ...prev,
      
      [locale]: {
        ...prev[locale],
        [key]: next,
      },
    }));
  };

  const setLangField = (key: string, next: string) => setField(lang, key, next);

  const validateContent = (): boolean => {
    const errors: FieldErrors = {};
    for (const field of CONTENT_FIELDS[collection]) {
      if (!field.required) continue;
      for (const locale of LOCALES) {
        const valueAt = content[locale][field.key];
        if (!valueAt.trim()) {
          errors[`${locale}:${field.key}`] = t("errors.bothLocalesRequired");
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAppearance = (): boolean => {
    const errors: FieldErrors = {};
    if (collection === "stats" && (value.trim() === "" || Number.isNaN(Number(value)))) {
      errors.value = t("errors.valueRequired");
    }
    if (collection === "gallery" && !imageUrl.trim()) {
      errors.image = t("errors.imageRequired");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const trimField = (locale: Locale, key: string) => content[locale][key].trim();

  const buildPayload = () => {
    const base = { displayOrder: Number(displayOrder) || 0, isActive };
    if (collection === "marquee") {
      return {
        ...base,
        icon: iconKey || null,
        translations: {
          fa: { text: trimField("fa", "text") },
          en: { text: trimField("en", "text") },
        },
      };
    }
    if (collection === "services") {
      return {
        ...base,
        icon: iconKey || null,
        image: imageUrl.trim() || null,
        translations: {
          fa: {
            title: trimField("fa", "title"),
            description: trimField("fa", "description") || null,
            ctaLabel: trimField("fa", "ctaLabel") || null,
          },
          en: {
            title: trimField("en", "title"),
            description: trimField("en", "description") || null,
            ctaLabel: trimField("en", "ctaLabel") || null,
          },
        },
      };
    }
    if (collection === "stats") {
      return {
        ...base,
        value: Number(value),
        compact,
        plus,
        translations: {
          fa: { label: trimField("fa", "label") },
          en: { label: trimField("en", "label") },
        },
      };
    }
    return {
      ...base,
      imageUrl: imageUrl.trim(),
      translations: {
        fa: {
          alt: trimField("fa", "alt"),
          caption: trimField("fa", "caption") || null,
        },
        en: {
          alt: trimField("en", "alt"),
          caption: trimField("en", "caption") || null,
        },
      },
    };
  };

  const handleSubmit = async () => {
    setServerError(null);
    setSubmitting(true);
    const pending = toast.loading(
      t(mode === "edit" ? "toast.saving" : "toast.creating"),
    );
    try {
      const result = await submitItemRequest({
        collection,
        itemId: initial?.id,
        payload: buildPayload(),
      });
      if (!result.ok) {
        setServerError(result.message ?? t("toast.error"));
        toast.error(t("toast.error"), { id: pending });
        return;
      }
      toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push(backHref);
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
    setServerError(null);
    const valid = step === 1 ? validateContent() : step === 2 ? validateAppearance() : true;
    if (valid) goTo(step + 1);
  };

  const onIconSelect = (key: string) => {
    setIconKey(key);
    setIconPickerOpen(false);
  };

  return {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    content,
    fieldErrors,
    serverError,
    submitting,
    setField,
    setLangField,
    iconKey,
    imageUrl,
    setImageUrl,
    value,
    setValue: (next: string) => setValue(next.replace(/[^0-9]/g, "")),
    compact,
    toggleCompact: () => setCompact((next) => !next),
    plus,
    togglePlus: () => setPlus((next) => !next),
    displayOrder,
    setDisplayOrder: (next: string) => setDisplayOrder(next.replace(/[^0-9]/g, "")),
    isActive,
    toggleActive: () => setIsActive((next) => !next),
    iconPickerOpen,
    setIconPickerOpen,
    handlePrimary,
    onIconSelect,
    backHref,
  };
}