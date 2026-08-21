"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import GroupGlyph from "../../create-group/GroupGlyph";
import { LOCALES } from "../helpers";
import type { LangContent } from "../types";
import { Panel, ReviewCard, ReviewLabel } from "../../create-group/ui";

export default function ReviewStep({
  content,
  slug,
  isActive,
  iconKey,
  ns = "guideWizard",
}: {
  content: Record<"en" | "fa", LangContent>;
  slug: string;
  isActive: boolean;
  iconKey: string;
  ns?: string;
}) {
  const t = useTranslations(ns);

  const localizationRows = LOCALES.map((locale) => ({
    locale,
    label: locale === "en" ? t("review.english") : t("review.persian"),
    name: locale === "en" ? content.en.name : content.fa.name,
    description:
      locale === "en" ? content.en.description : content.fa.description,
  }));

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

      <ReviewCard title={t("review.identity")}>
        <dl className="grid grid-cols-2 gap-4 p-5">
          <div className="space-y-1">
            <ReviewLabel>{t("review.guideName")}</ReviewLabel>
            <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
              {content.en.name.trim() || t("review.notProvided")}
            </dd>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.slug")}</ReviewLabel>
            <dd
              className="break-all text-dash-body font-medium text-content-primary"
              dir="ltr"
            >
              {slug || t("review.notProvided")}
            </dd>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.visibility")}</ReviewLabel>
            <dd
              className={`text-dash-body font-medium ${
                isActive ? "text-success" : "text-content-secondary"
              }`}
            >
              {isActive ? t("identity.activeLabel") : t("identity.inactiveLabel")}
            </dd>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.icon")}</ReviewLabel>
            <dd className="flex items-center gap-1.5 text-dash-body font-medium text-content-primary">
              <GroupGlyph name={iconKey} className="size-4 text-copper-strong" />
              <span dir="ltr">{iconKey}</span>
            </dd>
          </div>
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.localization")}>
        <div>
          {localizationRows.map((row, index) => (
            <div
              key={row.locale}
              dir={row.locale === "fa" ? "rtl" : "ltr"}
              className={`p-5 text-start ${
                index > 0 ? "border-t border-border-primary" : ""
              }`}
            >
              <ReviewLabel>{row.label}</ReviewLabel>
              <p className="mt-1 text-dash-body font-medium text-content-primary">
                {row.name.trim() || t("review.notProvided")}
              </p>
              <p className="mt-1 line-clamp-2 text-dash-body-sm text-content-secondary">
                {row.description.trim() || t("review.notProvided")}
              </p>
            </div>
          ))}
        </div>
      </ReviewCard>
    </div>
  );
}
