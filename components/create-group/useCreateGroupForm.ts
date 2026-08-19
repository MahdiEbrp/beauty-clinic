"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";

import type { AdminServiceGroup } from "@/lib/services/types";
import { createServiceGroupSchema } from "@/lib/validation/services";

import { STEPS, isKebabSlug, slugify } from "./helpers";
import { seedFromGroup } from "./initial-state";
import { buildGroupPayload, submitGroupRequest } from "./submit";
import type { FieldErrors, LangContent, LangSeo, Locale } from "./types";

export function useCreateGroupForm(initialGroup?: AdminServiceGroup) {
  const t = useTranslations("groupWizard");
  const router = useRouter();
  const mode: "create" | "edit" = initialGroup ? "edit" : "create";
  const seed = initialGroup ? seedFromGroup(initialGroup) : undefined;

  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Locale>("en");

  const [content, setContent] = useState<Record<Locale, LangContent>>(
    seed?.content ?? {
      en: { name: "", description: "" },
      fa: { name: "", description: "" },
    },
  );
  const [slugDraft, setSlugDraft] = useState(seed?.slugDraft ?? "");
  const [slugManual, setSlugManual] = useState(seed?.slugManual ?? false);
  const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(seed?.displayOrder ?? "0");

  const [iconKey, setIconKey] = useState(seed?.iconKey ?? "Sparkles");
  const [imageUrl, setImageUrl] = useState(seed?.imageUrl ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [seo, setSeo] = useState<Record<Locale, LangSeo>>(
    seed?.seo ?? { en: { title: "", description: "" }, fa: { title: "", description: "" } },
  );

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effectiveSlug = slugManual ? slugDraft : slugify(content.en.name);
  const currentStepKey = STEPS.find((s) => s.id === step)?.key ?? "identity";

  const currentContent = content[lang];

  const currentSeo = seo[lang];
  const seoFaIncomplete = !seo.fa.title.trim() || !seo.fa.description.trim();

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

  const patchSeo = (locale: Locale, patch: Partial<LangSeo>) => {
    setSeo((prev) =>
      locale === "en"
        ? { ...prev, en: { ...prev.en, ...patch } }
        : { ...prev, fa: { ...prev.fa, ...patch } },
    );
  };

  const setLangName = (value: string) => patchContent(lang, { name: value });
  const setLangDescription = (value: string) =>
    patchContent(lang, { description: value });
  const setSeoTitle = (value: string) => patchSeo(lang, { title: value });
  const setSeoDescription = (value: string) =>
    patchSeo(lang, { description: value });

  const toggleSlugMode = () => {
    if (slugManual) {
      setSlugManual(false);
      setSlugDraft("");
    } else {
      setSlugDraft(effectiveSlug);
      setSlugManual(true);
    }
  };

  const validateStep = (target: number): boolean => {
    const errors: FieldErrors = {};
    if (target === 1) {
      if (!currentContent.name.trim()) {
        if (lang === "en") errors.enName = t("errors.nameRequired");
        else errors.faName = t("errors.nameRequired");
      }
      if (!effectiveSlug.trim() || !isKebabSlug(effectiveSlug)) {
        errors.slug = t("errors.slugRequired");
      }
    }
    if (target === 3) {
      if (!content.en.name.trim()) errors.enName = t("errors.nameRequired");
      if (!content.fa.name.trim()) errors.faName = t("errors.nameRequired");
    }
    setFieldErrors(errors);
    return Object.values(errors).length === 0;
  };

  const applyValidationToStep = (
    issues: Array<{ path: Array<string | number | symbol> }>,
  ) => {
    const errors: FieldErrors = {};
    let target = 5;
    for (const issue of issues) {
      const path = issue.path.map(String);
      if (path[0] === "slug") {
        errors.slug = t("errors.slugRequired");
        target = Math.min(target, 1);
      }
      if (path[0] === "translations" && path[1] === "name") {
        if (path[2] === "en") {
          errors.enName = t("errors.nameRequired");
          target = Math.min(target, 1);
        }
        if (path[2] === "fa") {
          errors.faName = t("errors.nameRequired");
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
    const payload = buildGroupPayload({
      content,
      seo,
      slug: effectiveSlug,
      iconKey,
      imageUrl,
      displayOrder,
      isActive,
    });
    const parsed = createServiceGroupSchema.safeParse(payload);
    if (!parsed.success) {
      applyValidationToStep(parsed.error.issues);
      return;
    }

    setSubmitting(true);
    const pending = toast.loading(
      t(mode === "edit" ? "toast.saving" : "toast.creating"),
    );
    try {
      const result = await submitGroupRequest({
        groupId: mode === "edit" ? initialGroup?.id : undefined,
        payload: parsed.data,
      });
      if (!result.ok) {
        if (result.kind === "slug-taken") {
          setFieldErrors((prev) => ({ ...prev, slug: t("errors.slugTaken") }));
          goTo(1);
          toast.error(t("errors.slugTaken"), { id: pending });
        } else {
          const message = result.message;
          setServerError(message ?? t("toast.error"));
          toast.error(t("toast.error"), { id: pending });
        }
        return;
      }
      toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"), {
        id: pending,
      });
      router.push("/dashboard/services/manage/groups");
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
    currentContent,
    currentSeo,
    seoFaIncomplete,
    content,
    seo,
    effectiveSlug,
    slugManual,
    isActive,
    displayOrder,
    iconKey,
    imageUrl,
    iconPickerOpen,
    setIconPickerOpen,
    fieldErrors,
    serverError,
    submitting,
    setLangName,
    setLangDescription,
    setSeoTitle,
    setSeoDescription,
    setSlug: (value: string) => setSlugDraft(slugify(value)),
    toggleSlugMode,
    setIsActive,
    setDisplayOrder,
    setImageUrl,
    handlePrimary,
    onIconSelect,
  };
}
