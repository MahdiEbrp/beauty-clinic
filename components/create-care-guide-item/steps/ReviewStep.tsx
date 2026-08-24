"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Check, Sparkles } from "lucide-react";

import { Panel, ReviewCard, ReviewLabel } from "../../create-group/ui";
import type { LangContent } from "../types";

export default function ReviewStep({
  content,
  guideName,
  isActive,
  highlighted,
  ns = "guideItemWizard",
}: {
  content: Record<"en" | "fa", LangContent>;
  guideName: string;
  isActive: boolean;
  highlighted: boolean;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns);

  const rows = [
    {
      locale: "en",
      label: t("review.english"),
      title: content.en.title,
      description: content.en.description,
    },
    {
      locale: "fa",
      label: t("review.persian"),
      title: content.fa.title,
      description: content.fa.description,
    },
  ] as const;

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
            <ReviewLabel>{t("review.guide")}</ReviewLabel>
            <dd className="wrap-break-word text-dash-body font-medium text-content-primary">
              {guideName || t("review.notProvided")}
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
            <ReviewLabel>{t("review.featured")}</ReviewLabel>
            <dd className="flex items-center gap-1.5 text-dash-body font-medium text-content-primary">
              {highlighted ? (
                <Sparkles className="size-4 text-warning" aria-hidden="true" />
              ) : null}
              {highlighted ? t("identity.highlightedLabel") : t("identity.normalLabel")}
            </dd>
          </div>
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.localization")}>
        <div>
          {rows.map((row, index) => (
            <div
              key={row.locale}
              dir={row.locale === "fa" ? "rtl" : "ltr"}
              className={`p-5 text-start ${
                index > 0 ? "border-t border-border-primary" : ""
              }`}
            >
              <ReviewLabel>{row.label}</ReviewLabel>
              <p className="mt-1 text-dash-body font-medium text-content-primary">
                {row.title.trim() || t("review.notProvided")}
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
