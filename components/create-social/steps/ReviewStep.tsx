"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Check } from "lucide-react";
import { Panel, ReviewCard, ReviewLabel } from "../../create-group/ui";

export default function ReviewStep({
  url,
  imageUrl,
  labelFa,
  labelEn,
  displayOrder,
  isActive,
  ns,
}: {
  url: string;
  imageUrl: string;
  labelFa: string;
  labelEn: string;
  displayOrder: string;
  isActive: boolean;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns ?? "socialWizard");

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
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <ReviewLabel>{t("review.fa")}</ReviewLabel>
            <p className="truncate text-dash-body font-semibold text-content-primary">{labelFa || "—"}</p>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.en")}</ReviewLabel>
            <p className="truncate text-dash-body font-semibold text-content-primary">{labelEn || "—"}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <ReviewLabel>{t("review.url")}</ReviewLabel>
            <p dir="ltr" className="break-words text-start text-dash-body text-content-primary">{url || "—"}</p>
          </div>
          {imageUrl && (
            <div className="sm:col-span-2">
              <ReviewLabel>{t("review.image")}</ReviewLabel>
              <div className="mt-2 max-w-xs overflow-hidden rounded-card border border-border-primary bg-surface-tertiary/50">
                <img src={imageUrl} alt="" loading="lazy" className="h-32 w-full object-cover" />
              </div>
            </div>
          )}
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.settings")}>
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <ReviewLabel>{t("review.displayOrder")}</ReviewLabel>
            <p className="text-dash-body font-semibold text-content-primary">{displayOrder}</p>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.active")}</ReviewLabel>
            <p className="text-dash-body font-semibold text-content-primary">
              {t(isActive ? "review.activeYes" : "review.activeNo")}
            </p>
          </div>
        </dl>
      </ReviewCard>
    </div>
  );
}