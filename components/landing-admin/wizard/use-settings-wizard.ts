"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminLandingSettings } from "@/lib/landing/admin/types";

export const SETTINGS_STEPS = [
  { id: 1, key: "seo" },
  { id: 2, key: "sections" },
  { id: 3, key: "review" },
] as const;

export const SETTINGS_LANG_AWARE_STEPS = new Set<number>([1, 2]);

export const SECTION_KEYS = ["services", "about", "gallery", "contact"] as const;

export type SeoContent = { seoTitle: string; seoDescription: string };
export type SectionContent = { heading: string; description: string };

export function useSettingsWizard({ settings }: { settings: AdminLandingSettings }) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const backHref = "/dashboard/landing";

  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Locale>("fa");
  const [seo, setSeo] = useState<Record<Locale, SeoContent>>({
    fa: {
      seoTitle: settings.seo.translations.fa.seoTitle ?? "",
      seoDescription: settings.seo.translations.fa.seoDescription ?? "",
    },
    en: {
      seoTitle: settings.seo.translations.en.seoTitle ?? "",
      seoDescription: settings.seo.translations.en.seoDescription ?? "",
    },
  });
  const [sections, setSections] = useState<
    Record<string, Record<Locale, SectionContent>>
  >(() => {
    const seed: Record<string, Record<Locale, SectionContent>> = {};
    for (const section of settings.sections) {
      seed[section.key] = {
        fa: {
          heading: section.translations.fa.heading,
          description: section.translations.fa.description ?? "",
        },
        en: {
          heading: section.translations.en.heading,
          description: section.translations.en.description ?? "",
        },
      };
    }
    return seed;
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStepKey = SETTINGS_STEPS.find((s) => s.id === step)?.key ?? "seo";

  const goTo = (next: number) => {
    if (next >= 1 && next <= SETTINGS_STEPS.length) setStep(next);
  };

  const patchSeo = (locale: Locale, patch: Partial<SeoContent>) =>
    setSeo((prev) => ({
      ...prev,
      
      [locale]: { ...prev[locale], ...patch },
    }));

  const setLangSeoField = (key: keyof SeoContent, next: string) =>
    patchSeo(lang, { [key]: next });

  const patchSection = (
    key: string,
    locale: Locale,
    patch: Partial<SectionContent>,
  ) =>
    setSections((prev) => ({
      ...prev,
      [key]: {
        fa: {
          heading: prev[key]?.fa.heading ?? "",
          description: prev[key]?.fa.description ?? "",
          ...(locale === "fa" ? patch : {}),
        },
        en: {
          heading: prev[key]?.en.heading ?? "",
          description: prev[key]?.en.description ?? "",
          ...(locale === "en" ? patch : {}),
        },
      },
    }));

  const setLangSectionField = (key: string, field: keyof SectionContent, next: string) =>
    patchSection(key, lang, { [field]: next });

  const handleSubmit = async () => {
    setServerError(null);
    setSubmitting(true);
    const pending = toast.loading(t("toast.saving"));
    const payload = {
      seo: {
        fa: {
          seoTitle: seo.fa.seoTitle.trim() || null,
          seoDescription: seo.fa.seoDescription.trim() || null,
        },
        en: {
          seoTitle: seo.en.seoTitle.trim() || null,
          seoDescription: seo.en.seoDescription.trim() || null,
        },
      },
      sections: settings.sections.map((section) => {
        
        const content = sections[section.key] ?? {
          fa: { heading: "", description: "" },
          en: { heading: "", description: "" },
        };
        return {
          key: section.key,
          translations: {
            fa: {
              heading: content.fa.heading.trim() || section.translations.fa.heading,
              description: content.fa.description.trim() || null,
            },
            en: {
              heading: content.en.heading.trim() || section.translations.en.heading,
              description: content.en.description.trim() || null,
            },
          },
        };
      }),
    };
    try {
      const response = await fetch("/api/v1/landing/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("settings_save_failed");
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
    if (step === SETTINGS_STEPS.length) {
      void handleSubmit();
      return;
    }
    setServerError(null);
    goTo(step + 1);
  };

  return {
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    seo,
    sections,
    serverError,
    submitting,
    setLangSeoField,
    setLangSectionField,
    handlePrimary,
    backHref,
  };
}