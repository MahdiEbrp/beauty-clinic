"use client";

import { useTranslations } from "next-intl";

import { Field, Panel, inputClass } from "@/components/create-group/ui";
import type { FieldErrors, Locale } from "../types";

export default function LocalizationStep({
  lang,
  title,
  shortDesc,
  fullDesc,
  onTitleChange,
  onShortDescChange,
  onFullDescChange,
  errors,
  ns,
}: {
  lang: Locale;
  title: string;
  shortDesc: string;
  fullDesc: string;
  onTitleChange: (value: string) => void;
  onShortDescChange: (value: string) => void;
  onFullDescChange: (value: string) => void;
  errors: FieldErrors;
  ns?: "serviceWizard";
}) {
  const t = useTranslations(ns ?? "serviceWizard");
  const langLabel = t(`language.${lang}`);
  const titleError = lang === "en" ? errors.enTitle : errors.faTitle;

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

      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="grid gap-5"
      >
        <p className="text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
          {t(`language.${lang === "en" ? "enSection" : "faSection"}`)}
        </p>

        <div className="grid gap-5">
          <div>
            <Field
              id={`loc-title-${lang}`}
              label={t("localization.title")}
              error={titleError}
              required
            >
              <input
                id={`loc-title-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder={t("localization.titlePlaceholder", {
                  lang: langLabel,
                })}
                className={inputClass(Boolean(titleError))}
              />
            </Field>
          </div>

          <div>
            <Field
              id={`loc-short-${lang}`}
              label={t("localization.shortDesc")}
              hint={t("localization.shortDescHint")}
            >
              <input
                id={`loc-short-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={shortDesc}
                onChange={(event) => onShortDescChange(event.target.value)}
                placeholder={t("localization.shortDescPlaceholder", {
                  lang: langLabel,
                })}
                className={inputClass(false)}
              />
            </Field>
          </div>

          <div>
            <Field
              id={`loc-full-${lang}`}
              label={t("localization.fullDesc")}
              hint={t("localization.fullDescHint")}
            >
              <textarea
                id={`loc-full-${lang}`}
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={fullDesc}
                onChange={(event) => onFullDescChange(event.target.value)}
                placeholder={t("localization.fullDescPlaceholder", {
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
