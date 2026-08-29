"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Check } from "lucide-react";
import { Panel, ReviewCard, ReviewLabel } from "../../create-group/ui";
import { SETTING_TYPES } from "../helpers";
import type { SettingType } from "../types";

export default function ReviewStep({
  mode,
  keyValue,
  type,
  stringValue,
  numberValue,
  booleanValue,
  jsonValue,
  faValue,
  enValue,
  displayOrder,
  isActive,
  ns,
}: {
  mode: "create" | "edit";
  keyValue: string;
  type: SettingType;
  stringValue: string;
  numberValue: string;
  booleanValue: boolean;
  jsonValue: string;
  faValue: string;
  enValue: string;
  displayOrder: string;
  isActive: boolean;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns ?? "settingWizard");

  const preview = () => {
    if (type === "string") return stringValue.trim() || "—";
    if (type === "number") return numberValue || "—";
    if (type === "boolean") return t(booleanValue ? "review.true" : "review.false");
    if (type === "object" || type === "array") return jsonValue || "—";
    return [faValue.trim(), enValue.trim()].filter(Boolean).join(" / ") || "—";
  };

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
            <ReviewLabel>{t("review.key")}</ReviewLabel>
            <p dir="ltr" className="truncate text-dash-body font-semibold text-content-primary">
              {mode === "create" ? keyValue : keyValue || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <ReviewLabel>{t("review.type")}</ReviewLabel>
            <p className="text-dash-body font-semibold text-content-primary">
              {SETTING_TYPES.includes(type) ? t(`identity.typeOptions.${type}` as never) : type}
            </p>
          </div>
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.value")}>
        <div className="p-5">
          <p dir={type === "localized" ? undefined : "ltr"} className="wrap-break-word rounded-control border border-border-primary bg-surface-tertiary/40 p-4 text-start font-mono text-dash-body-sm text-content-primary">
            {preview()}
          </p>
          {type === "localized" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <ReviewLabel>{t("review.fa")}</ReviewLabel>
                <p className="wrap-break-word rounded-control bg-surface-tertiary/40 p-3 text-dash-body-sm text-content-primary">
                  {faValue.trim() || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <ReviewLabel>{t("review.en")}</ReviewLabel>
                <p dir="ltr" className="wrap-break-word rounded-control bg-surface-tertiary/40 p-3 text-dash-body-sm text-content-primary">
                  {enValue.trim() || "—"}
                </p>
              </div>
            </div>
          )}
        </div>
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