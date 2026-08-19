"use client";

import { useTranslations } from "next-intl";
import { Field, Panel, inputClass } from "@/components/create-group/ui";
import type { Locale } from "@/lib/services/types";
import { LangBadge } from "../../forms/fields";
import type { SeoContent } from "../use-settings-wizard";

export default function SeoStep({
  lang,
  seo,
  onChange,
}: {
  lang: Locale;
  seo: Record<Locale, SeoContent>;
  onChange: (key: keyof SeoContent, value: string) => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border-primary pb-4">
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {t("sections.seo")}
        </h3>
        <LangBadge lang={lang} />
      </div>
      <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-5">
        <Field
          id={`seo-title-${lang}`}
          label={t("fields.seoTitle")}
          hint={t("fields.seoTitleHint")}
        >
          <input
            id={`seo-title-${lang}`}
            dir={lang === "fa" ? "rtl" : "ltr"}
            
            value={seo[lang].seoTitle}
            onChange={(event) => onChange("seoTitle", event.target.value)}
            placeholder={t("fields.seoTitlePlaceholder")}
            className={inputClass(false)}
          />
        </Field>
        <Field
          id={`seo-desc-${lang}`}
          label={t("fields.seoDescription")}
          hint={t("fields.seoDescriptionHint")}
        >
          <textarea
            id={`seo-desc-${lang}`}
            dir={lang === "fa" ? "rtl" : "ltr"}
            
            value={seo[lang].seoDescription}
            onChange={(event) => onChange("seoDescription", event.target.value)}
            placeholder={t("fields.seoDescriptionPlaceholder")}
            rows={3}
            className={`${inputClass(false)} resize-y py-3`}
          />
        </Field>
      </div>
    </Panel>
  );
}