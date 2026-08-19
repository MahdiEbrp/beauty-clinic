"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/services/types";
import { Field, Panel, inputClass } from "@/components/create-group/ui";
import { LangBadge } from "../../forms/fields";
import { CONTENT_FIELDS } from "../steps";
import type { FieldErrors, WizardLangContent } from "../types";
import type { CollectionKey } from "../../types";

export default function ContentStep({
  collection,
  lang,
  content,
  errors,
  onChange,
}: {
  collection: CollectionKey;
  lang: Locale;
  content: WizardLangContent;
  errors: FieldErrors;
  onChange: (key: string, value: string) => void;
}) {
  const t = useTranslations("landingForm");

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border-primary pb-4">
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {t("sections.content")}
        </h3>
        <LangBadge lang={lang} />
      </div>
      <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-5">
        {
          
          CONTENT_FIELDS[collection].map((field) => {
          const error = errors[`${lang}:${field.key}`];
          return (
            <Field
              key={field.key}
              id={`landing-field-${field.key}-${lang}`}
              label={t(field.labelKey)}
              hint={field.hintKey ? t(field.hintKey) : undefined}
              error={error}
              required={field.required}
            >
              {field.type === "textarea" ? (
                <textarea
                  id={`landing-field-${field.key}-${lang}`}
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  value={content[lang][field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  placeholder={t(field.placeholderKey)}
                  rows={field.rows ?? 3}
                  className={`${inputClass(Boolean(error))} resize-y py-3`}
                />
              ) : (
                <input
                  id={`landing-field-${field.key}-${lang}`}
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  value={content[lang][field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  placeholder={t(field.placeholderKey)}
                  className={inputClass(Boolean(error))}
                />
              )}
            </Field>
          );
        })}
      </div>
    </Panel>
  );
}