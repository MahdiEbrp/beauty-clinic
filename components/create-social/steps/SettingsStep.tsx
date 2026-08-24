"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Field, Panel, inputClass } from "../../create-group/ui";
import type { FieldErrors } from "../types";

export default function SettingsStep({
  displayOrder,
  onDisplayOrderChange,
  isActive,
  onToggleActive,
  errors,
  ns,
}: {
  displayOrder: string;
  onDisplayOrderChange: (value: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
  errors: FieldErrors;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns ?? "socialWizard");
  return (
    <Panel>
      <div className="grid gap-6">
        <Field
          id="social-order"
          label={t("settings.displayOrder")}
          hint={t("settings.displayOrderHint")}
          error={errors.displayOrder}
        >
          <input
            id="social-order"
            dir="ltr"
            inputMode="numeric"
            value={displayOrder}
            onChange={(event) => onDisplayOrderChange(event.target.value.replace(/[^0-9]/g, ""))}
            className={inputClass(Boolean(errors.displayOrder))}
          />
        </Field>
        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("settings.active")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("settings.activeHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={t("settings.active")}
            onClick={onToggleActive}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? "bg-accent" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                isActive ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}