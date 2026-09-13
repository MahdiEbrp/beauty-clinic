"use client";

import { useTranslations } from "next-intl";

import type { FieldErrors, Locale } from "../types";
import { Field, Panel, inputClass } from "../../create-group/ui";

export default function LocalizationStep({
  lang,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  errors,
  ns,
}: {
  lang: Locale;
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  errors: FieldErrors;
  ns?: "rulesWizard";
}) {
  const t = useTranslations(ns ?? "rulesWizard");
  const langLabel = t(`language.${lang}`);
  const error = lang === "en" ? errors.enName : errors.faName;

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border-primary pb-4">
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {t("localization.title")}
        </h3>
        <span className="rounded-pill bg-copper/10 px-2.5 py-1 text-dash-caption font-bold text-copper-strong">
          {t("language.editing", { lang: langLabel })}
        </span>
      </div>

      <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-5">
        <p className="text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
          {t(`language.${lang === "en" ? "enSection" : "faSection"}`)}
        </p>
        <div className="grid gap-5">
          <div>
            <Field
              id={`rule-loc-name-${lang}`}
              label={t("localization.name")}
              error={error}
              required
            >
              <input
                id={`rule-loc-name-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder={t("localization.namePlaceholder", {
                  lang: langLabel,
                })}
                className={inputClass(Boolean(error))}
              />
            </Field>
          </div>
          <div>
            <Field
              id={`rule-loc-desc-${lang}`}
              label={t("localization.description")}
              hint={t("localization.descriptionHint")}
            >
              <textarea
                id={`rule-loc-desc-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder={t("localization.descriptionPlaceholder", {
                  lang: langLabel,
                })}
                rows={4}
                className={`${inputClass(false)} resize-y py-3`}
              />
            </Field>
          </div>
        </div>
      </div>
    </Panel>
  );
}
