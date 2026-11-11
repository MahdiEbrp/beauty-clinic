"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";

import type { AdminService } from "@/lib/services/types";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@/lib/validation/services";
import { isKebabSlug, slugify } from "./helpers";
import { seedFromService } from "./initial-state";
import { buildServicePayload, submitServiceRequest } from "./submit";
import type {
  CategoryOption,
  FieldErrors,
  LangContent,
  LangSeo,
  Locale,
} from "./types";

export function useCreateServiceForm(
  initialService?: AdminService,
  categoryOptions: CategoryOption[] = [],
  initialCategoryId?: string,
) {
  const t = useTranslations("serviceWizard");
  const router = useRouter();
  const mode: "create" | "edit" = initialService ? "edit" : "create";
  const seed = initialService ? seedFromService(initialService) : undefined;

  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Locale>("en");
  const [categoryId, setCategoryId] = useState(seed?.categoryId ?? initialCategoryId ?? "");
  const [content, setContent] = useState<Record<Locale, LangContent>>(
    seed?.content ?? {
      en: { title: "", shortDesc: "", fullDesc: "" },
      fa: { title: "", shortDesc: "", fullDesc: "" },
    },
  );
  const [seo, setSeo] = useState<Record<Locale, LangSeo>>(
    seed?.seo ?? {
      en: { title: "", description: "" },
      fa: { title: "", description: "" },
    },
  );
  const [slugDraft, setSlugDraft] = useState(seed?.slugDraft ?? "");
  const [slugManual, setSlugManual] = useState(seed?.slugManual ?? false);
    const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(seed?.isFeatured ?? false);
  const [displayOrder, setDisplayOrder] = useState(seed?.displayOrder ?? "0");
  const [price, setPrice] = useState<string | null>(seed?.price ?? null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceType, setPriceType] = useState(seed?.priceType ?? "fixed");
  const [durationMin, setDurationMin] = useState<string | null>(
    seed?.durationMin ?? null,
  );
  const [sessionsCount, setSessionsCount] = useState(
    seed?.sessionsCount ?? "1",
  );
  const [coverImage, setCoverImage] = useState(seed?.coverImage ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const STEPS = [
    { id: 1, key: "category" },
    { id: 2, key: "identity" },
    { id: 3, key: "pricing" },
    { id: 4, key: "appearance" },
    { id: 5, key: "localization" },
    { id: 6, key: "seo" },
    { id: 7, key: "review" },
  ] as const;

  const effectiveSlug = slugManual ? slugDraft : slugify(content.en.title);
  const currentStepKey = STEPS.find((s) => s.id === step)?.key ?? "category";
  const selectedCategory =
    categoryOptions.find((option) => option.id === categoryId) ?? null;

  const currentContent = content[lang];

  const currentSeo = seo[lang];
  const seoFaIncomplete = !seo.fa.title.trim() || !seo.fa.description.trim();

  const goTo = (next: number) => {
    if (next >= 1 && next <= 7) setStep(next);
  };
  const patchContent = (locale: Locale, patch: Partial<LangContent>) =>
    setContent((prev) =>
      locale === "en"
        ? { ...prev, en: { ...prev.en, ...patch } }
        : { ...prev, fa: { ...prev.fa, ...patch } },
    );
  const patchSeo = (locale: Locale, patch: Partial<LangSeo>) =>
    setSeo((prev) =>
      locale === "en"
        ? { ...prev, en: { ...prev.en, ...patch } }
        : { ...prev, fa: { ...prev.fa, ...patch } },
    );
  const setLangTitle = (value: string) => patchContent(lang, { title: value });
  const setLangShortDesc = (value: string) =>
    patchContent(lang, { shortDesc: value });
  const setLangFullDesc = (value: string) =>
    patchContent(lang, { fullDesc: value });
  const setSeoTitle = (value: string) => patchSeo(lang, { title: value });
  const setSeoDescription = (value: string) =>
    patchSeo(lang, { description: value });
  const setSlug = (value: string) => setSlugDraft(slugify(value));
  const toggleSlugMode = () => setSlugManual((v) => !v);

  function applyValidationToStep(
    issues: { path?: (string | number)[]; message?: string }[],
  ) {
    const errors: FieldErrors = {};
    let target = 7;
    for (const issue of issues) {
      const path = issue.path ?? [];
      if (path[0] === "categoryId") {
        errors.categoryId = t("errors.categoryRequired");
        target = Math.min(target, 1);
      }
      if (path[0] === "slug") {
        errors.slug = t("errors.slugInvalid");
        target = Math.min(target, 2);
      }
      if (path[0] === "price") {
        setPriceError(t("errors.priceInvalid"));
        target = Math.min(target, 3);
      }
      if (path[0] === "translations" && path[1] === "title") {
        if (path[2] === "en") {
          errors.enTitle = t("errors.titleRequired");
          target = Math.min(target, 2);
        }
        if (path[2] === "fa") {
          errors.faTitle = t("errors.titleRequired");
          target = Math.min(target, 5);
        }
      }
    }
    setFieldErrors(errors);
    goTo(target);
    toast.error(t("errors.generic"));
  }


  const handleCreate = async () => {
    setServerError(null);
    setPriceError(null);
    const payload = buildServicePayload({
      categoryId,
      content,
      seo,
      slug: effectiveSlug,
      price,
      priceType,
      durationMin,
      sessionsCount,
      coverImage,
      isActive,
      isFeatured,
      displayOrder,
    });
    const schema = mode === "edit" ? updateServiceSchema : createServiceSchema;
        const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      applyValidationToStep(
        parsed.error.issues as Array<{ path?: (string | number)[]; message?: string }>,
      );
      return;
    }
    setSubmitting(true);
    const pending = toast.loading(
      t(mode === "edit" ? "toast.saving" : "toast.creating"),
    );
    try {
      const result = await submitServiceRequest({
        serviceId: mode === "edit" ? initialService?.id : undefined,
        payload: parsed.data,
      });
      if (!result.ok) {
        if (result.kind === "slug-taken") {
          setFieldErrors((prev) => ({ ...prev, slug: t("errors.slugTaken") }));
          goTo(2);
          toast.error(t("errors.slugTaken"), { id: pending });
        } else {
          setServerError(result.message ?? t("toast.error"));
          toast.error(t("toast.error"), { id: pending });
        }
        return;
      }
      toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push("/dashboard/services/manage/services");
      router.refresh();
    } catch {
      setServerError(t("toast.error"));
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimary = () => {
    if (step === 7) {
      void handleCreate();
      return;
    }
    setServerError(null);
    setPriceError(null);
    void validateStep(step);
    goTo(step + 1);
  };

  function validateStep(step: number) {
    const errors: FieldErrors = {};
    if (step === 1 && !categoryId) {
      errors.categoryId = t("errors.categoryRequired");
    }
    if (step === 2) {
      if (!content.en.title.trim()) errors.enTitle = t("errors.titleRequired");
      if (!isKebabSlug(effectiveSlug)) {
        errors.slug = t("errors.slugInvalid");
      }
    }
    if (step === 5 && !content.fa.title.trim()) {
      errors.faTitle = t("errors.titleRequired");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    currentContent,
    currentSeo,
    seoFaIncomplete,
    content,
    seo,
    effectiveSlug,
    slugManual,
    isActive,
    isFeatured,
    displayOrder,
    categoryId,
    setCategoryId,
    selectedCategory,
    categoryOptions,
    price,
    priceError,
    priceType,
    durationMin,
    sessionsCount,
    coverImage,
    setLangTitle,
    setLangShortDesc,
    setLangFullDesc,
    setSeoTitle,
    setSeoDescription,
    setSlug,
    toggleSlugMode,
    setIsActive,
    setIsFeatured,
    setDisplayOrder,
    setPrice,
    setPriceType,
    setDurationMin,
    setSessionsCount,
    setCoverImage,
    fieldErrors,
    serverError,
    submitting,
    handlePrimary,
  };
}

