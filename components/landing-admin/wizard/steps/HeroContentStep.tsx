"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/services/types";
import { Field, Panel, inputClass } from "@/components/create-group/ui";
import { LangBadge } from "../../forms/fields";
import type { HeroLangContent } from "../use-hero-wizard";

export default function HeroContentStep({
  lang,
  content,
  errors,
  onChange,
}: {
  lang: Locale;
  content: Record<Locale, HeroLangContent>;
  errors: Record<string, string>;
  onChange: (key: keyof HeroLangContent, value: string) => void;
}) {
  const t = useTranslations("landingForm");
  const field = (key: keyof HeroLangContent) => ({
    
    value: content[lang][key],
    error: errors[`${lang}:${key}`],
  });

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border-primary pb-4">
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {t("sections.hero")}
        </h3>
        <LangBadge lang={lang} />
      </div>
      <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-5">
        <Field
          id={`hero-title-${lang}`}
          label={t("fields.title")}
          error={field("title").error}
          required
        >
          <input
            id={`hero-title-${lang}`}
            dir={lang === "fa" ? "rtl" : "ltr"}
            value={field("title").value}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder={t("fields.titlePlaceholder")}
            className={inputClass(Boolean(field("title").error))}
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
            value={field("tagline").value}
            onChange={(event) => onChange("tagline", event.target.value)}
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
            value={field("description").value}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder={t("fields.descriptionPlaceholder")}
            rows={4}
            className={`${inputClass(false)} resize-y py-3`}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={`hero-cta1-${lang}`}
            label={t("fields.ctaLabel1")}
            error={field("ctaLabel1").error}
            required
          >
            <input
              id={`hero-cta1-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={field("ctaLabel1").value}
              onChange={(event) => onChange("ctaLabel1", event.target.value)}
              placeholder={t("fields.ctaLabel1Placeholder")}
              className={inputClass(Boolean(field("ctaLabel1").error))}
            />
          </Field>
          <Field
            id={`hero-cta2-${lang}`}
            label={t("fields.ctaLabel2")}
            error={field("ctaLabel2").error}
            required
          >
            <input
              id={`hero-cta2-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={field("ctaLabel2").value}
              onChange={(event) => onChange("ctaLabel2", event.target.value)}
              placeholder={t("fields.ctaLabel2Placeholder")}
              className={inputClass(Boolean(field("ctaLabel2").error))}
            />
          </Field>
        </div>
      </div>
    </Panel>
  );
}