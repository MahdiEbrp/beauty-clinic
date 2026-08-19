"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Panel, ReviewCard, ReviewLabel } from "@/components/create-group/ui";
import type { Locale } from "@/lib/services/types";
import { SECTION_KEYS, type SeoContent, type SectionContent } from "../use-settings-wizard";

export default function SettingsReviewStep({
  seo,
  sections,
}: {
  seo: Record<Locale, SeoContent>;
  sections: Record<string, Record<Locale, SectionContent>>;
}) {
  const t = useTranslations("landingForm");
  return (
    <div className="grid gap-5">
      <Panel>
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-pill bg-copper/15 text-copper-strong">
            <Check className="size-8" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-dash-heading font-bold tracking-tight text-content-primary">
            {t("review.title")}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-dash-body-sm leading-6 text-content-secondary">
            {t("review.description")}
          </p>
        </div>
      </Panel>

      <ReviewCard title={t("review.seo")}>
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          {(["fa", "en"] as Locale[]).map((locale) => (
            <div
              key={locale}
              className="grid gap-3 rounded-control border border-surface-variant/60 bg-surface-primary p-4"
            >
              <ReviewLabel>
                {locale === "fa" ? t("review.persian") : t("review.english")}
              </ReviewLabel>
              <div className="space-y-1">
                <ReviewLabel>{t("fields.seoTitle")}</ReviewLabel>
                <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
                  {}
                  {seo[locale].seoTitle.trim() || t("review.notProvided")}
                </dd>
              </div>
              <div className="space-y-1">
                <ReviewLabel>{t("fields.seoDescription")}</ReviewLabel>
                <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
                  {}
                  {seo[locale].seoDescription.trim() || t("review.notProvided")}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.sections")}>
        <dl className="grid gap-4 p-5">
          {SECTION_KEYS.map((key) => {
            const section = sections[key] ?? {
              fa: { heading: "", description: "" },
              en: { heading: "", description: "" },
            };
            return (
              <div
                key={key}
                className="grid gap-3 rounded-control border border-surface-variant/60 bg-surface-primary p-4"
              >
                <ReviewLabel>{t(`sections.sectionKeys.${key}`)}</ReviewLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["fa", "en"] as Locale[]).map((locale) => (
                    <div key={locale} className="space-y-1">
                      <ReviewLabel>
                        {locale === "fa" ? t("review.persian") : t("review.english")}
                      </ReviewLabel>
                      <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
                        {section[locale].heading.trim() || t("review.notProvided")}
                      </dd>
                      {section[locale].description.trim() && (
                        <dd className="wrap-break-word text-dash-caption text-content-secondary">
                          {section[locale].description.trim()}
                        </dd>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </dl>
      </ReviewCard>
    </div>
  );
}