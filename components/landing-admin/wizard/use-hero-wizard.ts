"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminHero } from "@/lib/landing/admin/types";

export const HERO_STEPS = [
  { id: 1, key: "content" },
  { id: 2, key: "appearance" },
  { id: 3, key: "review" },
] as const;

export const HERO_LANG_AWARE_STEPS = new Set<number>([1]);

export type HeroLangContent = {
  title: string;
  tagline: string;
  description: string;
  ctaLabel1: string;
  ctaLabel2: string;
};

export function useHeroWizard({ hero }: { hero: AdminHero }) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const backHref = "/dashboard/landing";

  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Locale>("fa");
  const [content, setContent] = useState<Record<Locale, HeroLangContent>>({
    fa: {
      title: hero.translations.fa.title,
      tagline: hero.translations.fa.tagline ?? "",
      description: hero.translations.fa.description ?? "",
      ctaLabel1: hero.translations.fa.ctaLabel1,
      ctaLabel2: hero.translations.fa.ctaLabel2,
    },
    en: {
      title: hero.translations.en.title,
      tagline: hero.translations.en.tagline ?? "",
      description: hero.translations.en.description ?? "",
      ctaLabel1: hero.translations.en.ctaLabel1,
      ctaLabel2: hero.translations.en.ctaLabel2,
    },
  });
  const [iconKey, setIconKey] = useState(hero.taglineIcon ?? "");
  const [imageUrl, setImageUrl] = useState(hero.image ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStepKey = HERO_STEPS.find((s) => s.id === step)?.key ?? "content";

  const goTo = (next: number) => {
    if (next >= 1 && next <= HERO_STEPS.length) setStep(next);
  };

  const patchContent = (locale: Locale, patch: Partial<HeroLangContent>) => {
    setContent((prev) => ({
      ...prev,
      
      [locale]: { ...prev[locale], ...patch },
    }));
  };

  const setLangField = (key: keyof HeroLangContent, next: string) =>
    patchContent(lang, { [key]: next });

  const validateContent = (): boolean => {
    const required = ["title", "ctaLabel1", "ctaLabel2"] as const;
    const errors: Record<string, string> = {};
    for (const locale of ["fa", "en"] as Locale[]) {
      for (const key of required) {
        
        if (!content[locale][key].trim()) {
          errors[`${locale}:${key}`] = t("errors.heroRequired");
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setServerError(null);
    setSubmitting(true);
    const pending = toast.loading(t("toast.saving"));
    const trim = (locale: Locale, key: keyof HeroLangContent) =>
      content[locale][key].trim();
    const nullable = (locale: Locale, key: keyof HeroLangContent) =>
      trim(locale, key) || null;
    try {
      const response = await fetch("/api/v1/landing/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          image: imageUrl.trim() || null,
          taglineIcon: iconKey || null,
          translations: {
            fa: {
              title: trim("fa", "title"),
              tagline: nullable("fa", "tagline"),
              description: nullable("fa", "description"),
              ctaLabel1: trim("fa", "ctaLabel1"),
              ctaLabel2: trim("fa", "ctaLabel2"),
            },
            en: {
              title: trim("en", "title"),
              tagline: nullable("en", "tagline"),
              description: nullable("en", "description"),
              ctaLabel1: trim("en", "ctaLabel1"),
              ctaLabel2: trim("en", "ctaLabel2"),
            },
          },
        }),
      });
      if (!response.ok) throw new Error("hero_save_failed");
      toast.success(t("toast.updated"), { id: pending });
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
    if (step === HERO_STEPS.length) {
      void handleSubmit();
      return;
    }
    setServerError(null);
    if (step === 1 && !validateContent()) return;
    goTo(step + 1);
  };

  const onIconSelect = (key: string) => {
    setIconKey(key);
    setIconPickerOpen(false);
  };

  return {
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    content,
    fieldErrors,
    serverError,
    submitting,
    setLangField,
    iconKey,
    imageUrl,
    setImageUrl,
    iconPickerOpen,
    setIconPickerOpen,
    handlePrimary,
    onIconSelect,
    backHref,
  };
}