"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminHero } from "@/lib/landing/admin/types";
import IconPickerDialog from "@/components/create-group/IconPickerDialog";
import { Field, inputClass } from "@/components/create-group/ui";
import {
  FormHeader,
  IconField,
  ImageUrlField,
  LangTabs,
  LocalizedPanel,
  SubmitBar,
} from "./forms/fields";

type LangContent = {
  title: string;
  tagline: string;
  description: string;
  ctaLabel1: string;
  ctaLabel2: string;
};

export default function HeroForm({ hero }: { hero: AdminHero }) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const backHref = "/dashboard/landing";

  const [lang, setLang] = useState<Locale>("fa");
  const [content, setContent] = useState<Record<Locale, LangContent>>({
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
  const [imageUrl, setImageUrl] = useState(hero.image ?? "");
  const [iconKey, setIconKey] = useState(hero.taglineIcon ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const patchContent = (locale: Locale, patch: Partial<LangContent>) =>
    setContent((prev) =>
      locale === "fa"
        ? { ...prev, fa: { ...prev.fa, ...patch } }
        : { ...prev, en: { ...prev.en, ...patch } },
    );

  const handleSubmit = async () => {
    setServerError(null);
    const bothReady =
      content.fa.title.trim() &&
      content.en.title.trim() &&
      content.fa.ctaLabel1.trim() &&
      content.en.ctaLabel1.trim() &&
      content.fa.ctaLabel2.trim() &&
      content.en.ctaLabel2.trim();
    if (!bothReady) {
      setServerError(t("errors.heroRequired"));
      return;
    }
    setSubmitting(true);
    const pending = toast.loading(t("toast.saving"));
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
              title: content.fa.title.trim(),
              tagline: content.fa.tagline.trim() || null,
              description: content.fa.description.trim() || null,
              ctaLabel1: content.fa.ctaLabel1.trim(),
              ctaLabel2: content.fa.ctaLabel2.trim(),
            },
            en: {
              title: content.en.title.trim(),
              tagline: content.en.tagline.trim() || null,
              description: content.en.description.trim() || null,
              ctaLabel1: content.en.ctaLabel1.trim(),
              ctaLabel2: content.en.ctaLabel2.trim(),
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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="space-y-6 sm:space-y-8"
    >
      <FormHeader backHref={backHref} mode="edit" />

      <div className="flex justify-end">
        <LangTabs lang={lang} onChange={setLang} />
      </div>

      <div aria-live="polite" className="space-y-6">
        <LocalizedPanel title={t("sections.hero")} lang={lang}>
          <Field id={`hero-title-${lang}`} label={t("fields.title")} required>
            <input
              id={`hero-title-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].title}
              onChange={(event) => patchContent(lang, { title: event.target.value })}
              placeholder={t("fields.titlePlaceholder")}
              className={inputClass(false)}
            />
          </Field>
          <Field
            id={`hero-tagline-${lang}`}
            label={t("fields.tagline")}
            hint={t("fields.taglineHint")}
          >
            <input
              id={`hero-tagline-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].tagline}
              onChange={(event) => patchContent(lang, { tagline: event.target.value })}
              placeholder={t("fields.taglinePlaceholder")}
              className={inputClass(false)}
            />
          </Field>
          <Field
            id={`hero-desc-${lang}`}
            label={t("fields.description")}
            hint={t("fields.descriptionHint")}
          >
            <textarea
              id={`hero-desc-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].description}
              onChange={(event) => patchContent(lang, { description: event.target.value })}
              placeholder={t("fields.descriptionPlaceholder")}
              rows={4}
              className={`${inputClass(false)} resize-y py-3`}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`hero-cta1-${lang}`}
              label={t("fields.ctaLabel1")}
              required
            >
              <input
                id={`hero-cta1-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={content[lang].ctaLabel1}
                onChange={(event) => patchContent(lang, { ctaLabel1: event.target.value })}
                placeholder={t("fields.ctaLabel1Placeholder")}
                className={inputClass(false)}
              />
            </Field>
            <Field
              id={`hero-cta2-${lang}`}
              label={t("fields.ctaLabel2")}
              required
            >
              <input
                id={`hero-cta2-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={content[lang].ctaLabel2}
                onChange={(event) => patchContent(lang, { ctaLabel2: event.target.value })}
                placeholder={t("fields.ctaLabel2Placeholder")}
                className={inputClass(false)}
              />
            </Field>
          </div>
        </LocalizedPanel>

        <IconField iconKey={iconKey} onOpenPicker={() => setIconPickerOpen(true)} />

        <ImageUrlField value={imageUrl} onChange={setImageUrl} />

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

      <SubmitBar
        mode="edit"
        submitting={submitting}
        onCancel={() => router.push(backHref)}
      />

      <IconPickerDialog
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        selected={iconKey}
        onSelect={(key) => {
          setIconKey(key);
          setIconPickerOpen(false);
        }}
        ns="groupWizard"
      />
    </form>
  );
}