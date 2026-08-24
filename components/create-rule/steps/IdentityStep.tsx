"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { Lock, Pencil, RefreshCw, Sparkles, Unlock } from "lucide-react";

import type { FieldErrors, Locale } from "../types";
import { Field, Panel, inputClass } from "../../create-group/ui";

export default function IdentityStep({
  lang,
  name,
  onNameChange,
  slug,
  slugManual,
  onSlugChange,
  onToggleSlugMode,
  isActive,
  onToggleActive,
  highlighted,
  onToggleHighlighted,
  displayOrder,
  onDisplayOrderChange,
  errors,
  ns,
}: {
  lang: Locale;
  name: string;
  onNameChange: (value: string) => void;
  slug: string;
  slugManual: boolean;
  onSlugChange: (value: string) => void;
  onToggleSlugMode: () => void;
  isActive: boolean;
  onToggleActive: () => void;
  highlighted: boolean;
  onToggleHighlighted: () => void;
  displayOrder: string;
  onDisplayOrderChange: (value: string) => void;
  errors: FieldErrors;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns ?? "rulesWizard");
  const langLabel = t(`language.${lang}`);
  const nameError = lang === "en" ? errors.enName : errors.faName;

  return (
    <Panel>
      <div className="grid gap-6">
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-dash-caption font-bold text-content-secondary">
              {t("identity.ruleName")}
              <span className="ms-1 text-copper" aria-hidden="true">
                *
              </span>
            </span>
            <span className="rounded-pill bg-copper/10 px-2.5 py-1 text-dash-caption font-bold text-copper-strong">
              {t("language.editing", { lang: langLabel })}
            </span>
          </div>
          <input
            dir={lang === "fa" ? "rtl" : "ltr"}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={t("identity.ruleNamePlaceholder")}
            aria-label={t("identity.ruleName")}
            className={inputClass(Boolean(nameError))}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <p className="text-dash-caption text-content-tertiary">
              {t("identity.ruleNameHint")}
            </p>
            {nameError && (
              <p role="alert" className="text-dash-caption font-medium text-error">
                {nameError}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-dash-caption font-bold text-content-secondary">
              {t("identity.slug")}
              <span className="ms-1 text-copper" aria-hidden="true">
                *
              </span>
            </span>
            <button
              type="button"
              onClick={onToggleSlugMode}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-dash-caption font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {slugManual ? (
                <>
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  {t("identity.resetAuto")}
                </>
              ) : (
                <>
                  <Pencil className="size-3.5" aria-hidden="true" />
                  {t("identity.editManual")}
                </>
              )}
            </button>
          </div>
          <div
            className={`flex min-h-11 w-full items-center rounded-control border bg-form-input-bg transition-colors hover:border-border-interactive focus-within:border-copper focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
              errors.slug ? "border-error" : "border-form-input-border"
            }`}
          >
            <span
              dir="ltr"
              className="pointer-events-none shrink-0 ps-4 text-dash-caption text-content-tertiary"
            >
              {t("identity.slugPrefix")}
            </span>
            <input
              dir="ltr"
              name="slug"
              readOnly={!slugManual}
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
              placeholder="respect-appointments"
              aria-label={t("identity.slug")}
              aria-describedby="rule-slug-hint"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 font-medium text-dash-body text-accent outline-none placeholder:text-content-tertiary"
            />
            <span className="shrink-0 pe-4 text-dash-caption font-bold">
              {slugManual ? (
                <span className="inline-flex items-center gap-1 text-copper-strong">
                  <Unlock className="size-3.5" aria-hidden="true" />
                  {t("identity.custom")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-success">
                  <Lock className="size-3.5" aria-hidden="true" />
                  {t("identity.auto")}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <p id="rule-slug-hint" className="text-dash-caption text-content-tertiary">
              {t("identity.slugHint")}
            </p>
            {errors.slug && (
              <p role="alert" className="text-dash-caption font-medium text-error">
                {errors.slug}
              </p>
            )}
          </div>
        </div>

        <Field
          id="rule-order"
          label={t("identity.displayOrder")}
          hint={t("identity.displayOrderHint")}
        >
          <input
            id="rule-order"
            dir="ltr"
            inputMode="numeric"
            value={displayOrder}
            onChange={(event) =>
              onDisplayOrderChange(event.target.value.replace(/[^0-9]/g, ""))
            }
            className={inputClass(false)}
          />
        </Field>

        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("identity.active")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("identity.activeHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={t("identity.active")}
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

        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="flex items-center gap-1.5 text-dash-body font-semibold text-content-primary">
              <Sparkles className="size-4 text-copper-strong" aria-hidden="true" />
              {t("identity.highlighted")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("identity.highlightedHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={highlighted}
            aria-label={t("identity.highlighted")}
            onClick={onToggleHighlighted}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              highlighted ? "bg-copper" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                highlighted ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}
