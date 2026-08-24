"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Check } from "lucide-react";
import { Field, Panel, inputClass } from "../../create-group/ui";
import { SETTING_TYPES } from "../helpers";
import type { FieldErrors, SettingType } from "../types";

const TYPE_HINTS: Record<SettingType, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  object: "object",
  array: "array",
  localized: "localized",
};

export default function IdentityStep({
  keyValue,
  onKeyChange,
  type,
  onTypeChange,
  errors,
  editableKey,
  ns,
}: {
  keyValue: string;
  onKeyChange: (value: string) => void;
  type: SettingType;
  onTypeChange: (value: SettingType) => void;
  errors: FieldErrors;
  editableKey: boolean;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns ?? "settingWizard");

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="grid gap-6">
          <Field
            id="setting-key"
            label={t("identity.key")}
            hint={editableKey ? t("identity.keyHint") : undefined}
            error={errors.key}
            required={editableKey}
          >
            <input
              id="setting-key"
              dir="ltr"
              value={keyValue}
              onChange={(event) => onKeyChange(event.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
              disabled={!editableKey}
              placeholder="clinic.opening_hours"
              className={inputClass(Boolean(errors.key))}
            />
          </Field>
        </div>
      </Panel>

      <Panel>
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {t("identity.type")}
        </h3>
        <p className="mt-1 text-dash-body-sm text-content-secondary">
          {t("identity.typeHint")}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SETTING_TYPES.map((option) => {
            const active = type === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onTypeChange(option)}
                className={`inline-flex min-h-12 items-center justify-between gap-3 rounded-control border px-4 py-3 text-start text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "border-copper bg-copper/10 text-copper-strong"
                    : "border-border-interactive bg-surface-secondary text-content-secondary hover:bg-surface-tertiary hover:text-accent"
                }`}
              >
                <span>{t(`identity.typeOptions.${option}` as never)}</span>
                {active && <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-dash-caption text-content-tertiary">
          {t(`identity.typeHints.${TYPE_HINTS[type]}` as never)}
        </p>
      </Panel>
    </div>
  );
}