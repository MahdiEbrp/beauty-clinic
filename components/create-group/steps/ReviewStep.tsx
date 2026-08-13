"use client";

import { useTranslations } from "next-intl";
import { Check, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";

import { LOCALES } from "../helpers";
import GroupGlyph from "../GroupGlyph";
import type { LangContent, LangSeo } from "../types";
import { Panel, ReviewCard, ReviewLabel } from "../ui";

export default function ReviewStep({
  content,
  seo,
  slug,
  isActive,
  iconKey,
  imageUrl,
  ns,
  extraSummary,
}: {
  content: Record<"en" | "fa", LangContent>;
  seo: Record<"en" | "fa", LangSeo>;
  slug: string;
  isActive: boolean;
  iconKey: string;
  imageUrl: string;
  ns?: string;
  extraSummary?: { label: string; value: string };
}) {
  const t = useTranslations(ns ?? "groupWizard");

  const seoIncomplete =
    !seo.en.title.trim() ||
    !seo.en.description.trim() ||
    !seo.fa.title.trim() ||
    !seo.fa.description.trim();

  const localizationRows = LOCALES.map((locale) => ({
    locale,
    label: locale === "en" ? t("review.english") : t("review.persian"),
    name: locale === "en" ? content.en.name : content.fa.name,
    description:
      locale === "en" ? content.en.description : content.fa.description,
  }));

  const seoRows = LOCALES.map((locale) => ({
    locale,
    label: locale === "en" ? t("review.english") : t("review.persian"),
    title: locale === "en" ? seo.en.title : seo.fa.title,
    description: locale === "en" ? seo.en.description : seo.fa.description,
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
          {extraSummary && (
            <div className="space-y-1">
              <ReviewLabel>{extraSummary.label}</ReviewLabel>
              <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
                {extraSummary.value || t("review.notProvided")}
              </dd>
            </div>
          )}
          <div className="space-y-1">
            <ReviewLabel>{t("review.groupName")}</ReviewLabel>
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

      <ReviewCard title={t("review.appearance")}>
        <div className="flex items-center gap-4 p-5">
          <div className="relative flex size-16 shrink-0 overflow-hidden rounded-control border border-border-primary bg-surface-tertiary/40">
            {imageUrl.trim() ? (
              <NextImage
                src={imageUrl.trim()}
                alt={t("appearance.image")}
                fill
                sizes="4rem"
                unoptimized
                className="object-cover"
              />
            ) : (
              <ImageIcon className="m-auto size-5 text-content-tertiary" aria-hidden="true" />
            )}
          </div>
          <p className="text-dash-body-sm text-content-secondary">
            {imageUrl.trim() ? t("review.imageSet") : t("review.notSet")}
          </p>
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

      <ReviewCard
        title={t("review.seo")}
        badge={
          <span
            className={`rounded-pill px-2 py-0.5 text-dash-caption font-bold ${
              seoIncomplete
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            }`}
          >
            {seoIncomplete ? t("review.incomplete") : t("review.optimized")}
          </span>
        }
      >
        <div>
          {seoRows.map((row, index) => (
            <div
              key={row.locale}
              dir={row.locale === "fa" ? "rtl" : "ltr"}
              className={`p-5 text-start ${
                index > 0 ? "border-t border-border-primary" : ""
              }`}
            >
              <ReviewLabel>{row.label}</ReviewLabel>
              <p className="mt-1 text-dash-body font-medium text-content-primary">
                {row.title.trim() || t("review.notSet")}
              </p>
              <p className="mt-1 line-clamp-2 text-dash-body-sm text-content-secondary">
                {row.description.trim() || t("review.notSet")}
              </p>
            </div>
          ))}
        </div>
      </ReviewCard>
    </div>
  );
}
