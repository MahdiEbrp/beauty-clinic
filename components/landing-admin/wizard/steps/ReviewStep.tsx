"use client";

import { useTranslations } from "next-intl";
import { Check, ImageIcon } from "lucide-react";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { Panel, ReviewCard, ReviewLabel } from "@/components/create-group/ui";
import { CONTENT_FIELDS, isStat, usesIcon, usesImage } from "../steps";
import type { WizardLangContent } from "../types";
import type { CollectionKey } from "../../types";

const LOCALES = ["fa", "en"] as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <ReviewLabel>{label}</ReviewLabel>
      <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
        {value}
      </dd>
    </div>
  );
}

export default function ReviewStep({
  collection,
  content,
  iconKey,
  imageUrl,
  value,
  plus,
  compact,
  displayOrder,
  isActive,
}: {
  collection: CollectionKey;
  content: WizardLangContent;
  iconKey: string;
  imageUrl: string;
  value: string;
  plus: boolean;
  compact: boolean;
  displayOrder: string;
  isActive: boolean;
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
          {LOCALES.map((locale) => (
            <div
              key={locale}
              className="grid gap-3 rounded-control border border-surface-variant/60 bg-surface-primary p-4"
            >
              <ReviewLabel>
                {locale === "fa" ? t("review.persian") : t("review.english")}
              </ReviewLabel>
              {
                
                CONTENT_FIELDS[collection].map((field) => (
                <Row
                  key={field.key}
                  label={t(field.labelKey)}
                  value={
                    
                    content[locale][field.key].trim() || t("review.notProvided")
                  }
                />
              ))}
            </div>
          ))}
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.appearance")}>
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {usesIcon(collection) && (
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
          )}
          {usesImage(collection) && (
            <div className="space-y-1">
              <ReviewLabel>{t("review.image")}</ReviewLabel>
              <dd className="break-all text-dash-body font-medium text-content-primary" dir="ltr">
                {imageUrl.trim() || t("review.notProvided")}
              </dd>
            </div>
          )}
          {isStat(collection) && (
            <div className="space-y-1">
              <ReviewLabel>{t("review.value")}</ReviewLabel>
              <dd className="text-dash-body font-medium text-content-primary">
                {value ? `${value}${plus ? "+" : ""}` : t("review.notProvided")}
              </dd>
            </div>
          )}
          {isStat(collection) && (
            <div className="space-y-1">
              <ReviewLabel>{t("review.compact")}</ReviewLabel>
              <dd className="text-dash-body font-medium text-content-primary">
                {compact ? t("review.yes") : t("review.no")}
              </dd>
            </div>
          )}
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.settings")}>
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <ReviewLabel>{t("review.order")}</ReviewLabel>
            <dd className="text-dash-body font-medium text-content-primary" dir="ltr">
              {displayOrder}
            </dd>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.active")}</ReviewLabel>
            <dd
              className={`text-dash-body font-medium ${
                isActive ? "text-success" : "text-content-secondary"
              }`}
            >
              {isActive ? t("review.active") : t("review.inactive")}
            </dd>
          </div>
        </dl>
      </ReviewCard>
    </div>
  );
}