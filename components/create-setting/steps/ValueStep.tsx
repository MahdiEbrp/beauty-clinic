"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Field, Panel, inputClass } from "../../create-group/ui";
import { LangBadge } from "../../landing-admin/forms/fields";
import type { Locale } from "../types";
import type { FieldErrors } from "../types";

export default function ValueStep({
  type,
  lang,
  stringValue,
  onStringChange,
  numberValue,
  onNumberChange,
  booleanValue,
  onBooleanChange,
  jsonValue,
  onJsonChange,
  currentValue,
  onCurrentValueChange,
  errors,
  ns,
}: {
  type: string;
  lang: Locale;
  stringValue: string;
  onStringChange: (value: string) => void;
  numberValue: string;
  onNumberChange: (value: string) => void;
  booleanValue: boolean;
  onBooleanChange: (value: boolean) => void;
  jsonValue: string;
  onJsonChange: (value: string) => void;
  currentValue: string;
  onCurrentValueChange: (value: string) => void;
  errors: FieldErrors;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns ?? "settingWizard");

  if (type === "localized") {
    return (
      <Panel>
        <div className="mb-4">
          <LangBadge lang={lang} />
        </div>
        <div className="grid gap-6">
          <Field
            id="setting-localized-value"
            label={lang === "fa" ? t("value.faLabel") : t("value.enLabel")}
            error={lang === "fa" ? errors.faValue : errors.enValue}
            required
          >
            <textarea
              id="setting-localized-value"
              value={currentValue}
              onChange={(event) => onCurrentValueChange(event.target.value)}
              rows={4}
              className={`min-h-28 w-full resize-y rounded-control border bg-form-input-bg px-4 py-3 text-dash-body text-accent outline-none transition-colors placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                errors.faValue || errors.enValue ? "border-error" : "border-form-input-border"
              }`}
            />
          </Field>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="grid gap-6">
        {type === "string" && (
          <Field id="setting-string" label={t("value.stringLabel")} error={errors.value} required>
            <input
              id="setting-string"
              value={stringValue}
              onChange={(event) => onStringChange(event.target.value)}
              className={inputClass(Boolean(errors.value))}
            />
          </Field>
        )}

        {type === "number" && (
          <Field id="setting-number" label={t("value.numberLabel")} error={errors.value} required>
            <input
              id="setting-number"
              dir="ltr"
              inputMode="decimal"
              value={numberValue}
              onChange={(event) => onNumberChange(event.target.value)}
              className={inputClass(Boolean(errors.value))}
            />
          </Field>
        )}

        {type === "boolean" && (
          <div>
            <p className="text-dash-caption font-bold text-content-secondary">{t("value.booleanLabel")}</p>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-control border border-border-primary bg-surface-tertiary/40 p-4">
              <span className="text-dash-body text-content-primary">
                {booleanValue ? t("value.booleanTrue") : t("value.booleanFalse")}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={booleanValue}
                aria-label={t("value.booleanLabel")}
                onClick={() => onBooleanChange(!booleanValue)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  booleanValue ? "bg-accent" : "bg-surface-tertiary"
                }`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                    booleanValue ? "inset-e-1" : "inset-s-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {(type === "object" || type === "array") && (
          <Field id="setting-json" label={t("value.jsonLabel")} error={errors.value} hint={t("value.jsonHint")} required>
            <textarea
              id="setting-json"
              dir="ltr"
              value={jsonValue}
              onChange={(event) => onJsonChange(event.target.value)}
              rows={7}
              placeholder={type === "array" ? "[ ... ]" : "{ ... }"}
              className={`min-h-40 w-full resize-y rounded-control border bg-form-input-bg px-4 py-3 font-mono text-dash-body-sm text-accent outline-none transition-colors placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                errors.value ? "border-error" : "border-form-input-border"
              }`}
            />
          </Field>
        )}
      </div>
    </Panel>
  );
}