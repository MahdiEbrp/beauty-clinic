"use client";

import { useTranslations } from "next-intl";
import { Field, Panel, inputClass } from "@/components/create-group/ui";
import type { Locale } from "@/lib/services/types";
import { LangBadge } from "../../forms/fields";
import { SECTION_KEYS, type SectionContent } from "../use-settings-wizard";

export default function SectionsStep({
  lang,
  sections,
  onChange,
}: {
  lang: Locale;
  sections: Record<string, Record<Locale, SectionContent>>;
  onChange: (key: string, field: keyof SectionContent, value: string) => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border-primary pb-4">
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {t("sections.sections")}
        </h3>
        <LangBadge lang={lang} />
      </div>
      <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-8">
        {SECTION_KEYS.map((key) => {
          
          const section = sections[key] ?? {
            fa: { heading: "", description: "" },
            en: { heading: "", description: "" },
          };
          return (
            <div key={key} className="grid gap-5">
              <p className="border-b border-border-primary pb-2 text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
                {t(`sections.sectionKeys.${key}`)}
              </p>
              <Field id={`section-heading-${key}-${lang}`} label={t("fields.heading")}>
                <input
                  id={`section-heading-${key}-${lang}`}
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  
                  value={section[lang].heading}
                  onChange={(event) => onChange(key, "heading", event.target.value)}
                  placeholder={t("fields.headingPlaceholder")}
                  className={inputClass(false)}
                />
              </Field>
              <Field
                id={`section-desc-${key}-${lang}`}
                label={t("fields.description")}
                hint={t("fields.descriptionHint")}
              >
                <textarea
                  id={`section-desc-${key}-${lang}`}
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  value={section[lang].description}
                  onChange={(event) => onChange(key, "description", event.target.value)}
                  placeholder={t("fields.descriptionPlaceholder")}
                  rows={2}
                  className={`${inputClass(false)} resize-y py-3`}
                />
              </Field>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}