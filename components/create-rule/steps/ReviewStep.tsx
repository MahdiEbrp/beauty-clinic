"use client";

import { useTranslations } from "next-intl";
import { Check, Image as ImageIcon } from "lucide-react";

import GroupGlyph from "@/components/create-group/GroupGlyph";

import { LOCALES } from "../helpers";
import type { LangContent } from "../types";
import { Panel, ReviewCard, ReviewLabel } from "../../create-group/ui";

export default function ReviewStep({
  content,
  slug,
  isActive,
  highlighted,
  iconKey,
  color,
  imageUrl,
  ns,
}: {
  content: Record<"en" | "fa", LangContent>;
  slug: string;
  isActive: boolean;
  highlighted: boolean;
  iconKey: string;
  color: string;
  imageUrl: string;
  ns?: string;
}) {
  const t = useTranslations(ns ?? "rulesWizard");

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
            <ReviewLabel>{t("review.ruleName")}</ReviewLabel>
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
            <ReviewLabel>{t("identity.highlightedLabel")}</ReviewLabel>
            <dd
              className={`text-dash-body font-medium ${
                highlighted ? "text-copper-strong" : "text-content-secondary"
              }`}
            >
              {highlighted
                ? t("identity.highlightedLabel")
                : t("review.notSet")}
            </dd>
          </div>
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.appearance")}>
        <div className="flex items-center gap-4 p-5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-primary text-copper">
            <GroupGlyph name={iconKey} className="size-7" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-dash-body font-medium text-content-primary" dir="ltr">
              {iconKey}
            </p>
            <p className="text-dash-caption text-content-secondary" dir="ltr">
              {t("review.color")}: {color}
            </p>
          </div>
          <div className="relative ms-auto flex size-16 shrink-0 overflow-hidden rounded-control border border-border-primary bg-surface-tertiary/40">
            {imageUrl.trim() ? (
              <img
                src={imageUrl.trim()}
                alt={t("appearance.image")}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="m-auto size-5 text-content-tertiary" aria-hidden="true" />
            )}
          </div>
        </div>
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
