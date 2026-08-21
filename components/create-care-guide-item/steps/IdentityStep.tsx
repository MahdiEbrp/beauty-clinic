"use client";

import { useTranslations } from "next-intl";

import type { FieldErrors, Locale } from "../types";
import { Field, Panel, inputClass } from "../../create-group/ui";

export default function IdentityStep({
  lang,
  title,
  onTitleChange,
  isActive,
  onToggleActive,
  highlighted,
  onToggleHighlighted,
  displayOrder,
  onDisplayOrderChange,
  errors,
}: {
  lang: Locale;
  title: string;
  onTitleChange: (value: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
  highlighted: boolean;
  onToggleHighlighted: () => void;
  displayOrder: string;
  onDisplayOrderChange: (value: string) => void;
  errors: FieldErrors;
}) {
  const t = useTranslations("guideItemWizard");
  const langLabel = t(`language.${lang}`);
  const titleError = lang === "en" ? errors.enTitle : errors.faTitle;

  return (
    <Panel>
      <div className="grid gap-6">
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-dash-caption font-bold text-content-secondary">
              {t("identity.title")}
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
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={t("identity.titlePlaceholder")}
            aria-label={t("identity.title")}
            className={inputClass(Boolean(titleError))}
          />
          {titleError && (
            <p role="alert" className="text-dash-caption font-medium text-error">
              {titleError}
            </p>
          )}
        </div>

        <Field
          id="item-order"
          label={t("identity.displayOrder")}
          hint={t("identity.displayOrderHint")}
        >
          <input
            id="item-order"
            dir="ltr"
            inputMode="numeric"
            value={displayOrder}
            onChange={(event) =>
              onDisplayOrderChange(event.target.value.replace(/[^0-9]/g, ""))
            }
            className={inputClass(false)}
          />
        </Field>

        <div className="grid gap-4 border-t border-border-primary pt-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-0.5">
              <p className="text-dash-body font-semibold text-content-primary">
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
                highlighted ? "bg-warning" : "bg-surface-tertiary"
              }`}
            >
              <span
                className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                  highlighted ? "inset-e-1" : "inset-s-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
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
        </div>
      </div>
    </Panel>
  );
}
