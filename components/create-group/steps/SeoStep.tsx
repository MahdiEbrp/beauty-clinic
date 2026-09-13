"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import { siteUrl } from "@/lib/site";

import type { Locale } from "../types";
import { Panel, inputClass } from "../ui";

/** The namespaces that render the shared SEO step. */
type SeoStepNamespace = "groupWizard" | "categoryWizard" | "serviceWizard";

export default function SeoStep({
  lang,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  slug,
  faIncomplete,
  ns,
}: {
  lang: Locale;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  slug: string;
  faIncomplete: boolean;
  ns?: SeoStepNamespace;
}) {
  const t = useTranslations(ns ?? "groupWizard");

  return (
    <Panel>
      <div className="grid gap-8 sm:gap-10">
        <section>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("seo.title")}
          </h3>
          <div
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="mt-4 overflow-hidden rounded-control border border-border-primary bg-surface-primary p-4 shadow-elevation-1 sm:p-5"
          >
            <div className="truncate text-dash-body leading-6 text-content-primary underline decoration-copper-strong/40 underline-offset-2 hover:text-copper-strong">
              {title.trim() || t("seo.noTitle")}
            </div>
            <div className="truncate text-dash-caption text-content-secondary" dir="ltr">
              {`${siteUrl.replace(/^https?:\/\//, "")}/${lang === "fa" ? "" : "en/"}services/${slug || "untitled"}`}
            </div>
            <div className="mt-1 line-clamp-2 text-dash-body-sm text-content-secondary">
              {description.trim() || t("seo.noDescription")}
            </div>
          </div>
        </section>

        <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-dash-caption font-bold text-content-secondary">
                {t("seo.pageTitle")}
              </span>
              <span
                className="text-dash-caption font-medium text-content-tertiary"
                dir="ltr"
              >
                {t("seo.chars", { count: title.length, max: 60 })}
              </span>
            </div>
            <div className="mt-1.5">
              <input
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder={t("seo.pageTitlePlaceholder")}
                maxLength={60}
                className={inputClass(false)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-dash-caption font-bold text-content-secondary">
                {t("seo.metaDescription")}
              </span>
              <span
                className="text-dash-caption font-medium text-content-tertiary"
                dir="ltr"
              >
                {t("seo.chars", { count: description.length, max: 160 })}
              </span>
            </div>
            <div className="mt-1.5">
              <textarea
                dir={lang === "fa" ? "rtl" : "ltr"}
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder={t("seo.metaDescriptionPlaceholder")}
                maxLength={160}
                rows={3}
                className={`${inputClass(false)} resize-y py-3`}
              />
            </div>
          </div>

          {lang === "fa" && faIncomplete && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-control border border-warning/30 bg-warning/10 p-3.5 text-dash-body-sm text-warning"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="font-bold">{t("seo.incompleteTitle")}</p>
                <p className="text-warning/90">{t("seo.incompleteDescription")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
