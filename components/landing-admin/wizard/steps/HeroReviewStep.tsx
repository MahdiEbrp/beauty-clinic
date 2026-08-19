"use client";

import { useTranslations } from "next-intl";
import { Check, ImageIcon } from "lucide-react";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { Panel, ReviewCard, ReviewLabel } from "@/components/create-group/ui";
import type { Locale } from "@/lib/services/types";
import type { HeroLangContent } from "../use-hero-wizard";

export default function HeroReviewStep({
  content,
  iconKey,
  imageUrl,
}: {
  content: Record<Locale, HeroLangContent>;
  iconKey: string;
  imageUrl: string;
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

      <ReviewCard title={t("review.content")}>
        <dl className="grid gap-4 p-5">
          {(["fa", "en"] as Locale[]).map((locale) => (
            <div
              key={locale}
              className="grid gap-3 rounded-control border border-surface-variant/60 bg-surface-primary p-4"
            >
              <ReviewLabel>
                {locale === "fa" ? t("review.persian") : t("review.english")}
              </ReviewLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["title", "fields.title"],
                    ["tagline", "fields.tagline"],
                    ["description", "fields.description"],
                    ["ctaLabel1", "fields.ctaLabel1"],
                    ["ctaLabel2", "fields.ctaLabel2"],
                  ] as const
                ).map(([key, labelKey]) => (
                  <div key={key} className="space-y-1">
                    <ReviewLabel>{t(labelKey)}</ReviewLabel>
                    <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
                      {
                        
                        content[locale][key].trim() || t("review.notProvided")
                      }
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.appearance")}>
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <ReviewLabel>{t("review.icon")}</ReviewLabel>
            <dd className="flex items-center gap-2 text-dash-body font-medium text-content-primary">
              <span className="inline-flex size-8 items-center justify-center rounded-pill bg-surface-tertiary text-accent">
                {iconKey ? (
                  <GroupGlyph name={iconKey} className="size-4" />
                ) : (
                  <ImageIcon className="size-4" aria-hidden="true" />
                )}
              </span>
              {iconKey || t("review.notProvided")}
            </dd>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.image")}</ReviewLabel>
            <dd className="break-all text-dash-body font-medium text-content-primary" dir="ltr">
              {imageUrl.trim() || t("review.notProvided")}
            </dd>
          </div>
        </dl>
      </ReviewCard>
    </div>
  );
}