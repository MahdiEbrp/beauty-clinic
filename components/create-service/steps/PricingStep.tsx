"use client";

import { useTranslations } from "next-intl";
import { Field, Panel, inputClass } from "../../create-group/ui";
import type { PriceType } from "../types";

export default function PricingStep({
  price,
  priceError,
  onPriceChange,
  priceType,
  onPriceTypeChange,
  durationMin,
  onDurationMinChange,
  sessionsCount,
  onSessionsCountChange,
  isFeatured,
  onToggleFeatured,
}: {
  price: string | null;
  priceError: string | null;
  onPriceChange: (value: string | null) => void;
  priceType: PriceType;
  onPriceTypeChange: (value: PriceType) => void;
  durationMin: string | null;
  onDurationMinChange: (value: string | null) => void;
  sessionsCount: string;
  onSessionsCountChange: (value: string) => void;
  isFeatured: boolean;
  onToggleFeatured: () => void;
}) {
  const t = useTranslations("serviceWizard");
  const isRequest = priceType === "on_request";

  return (
    <Panel>
      <div className="grid gap-6">
        <div>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("pricing.title")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("pricing.hint")}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-control border border-border-primary bg-surface-primary px-3 py-2">
          <span className="text-dash-caption font-bold text-content-secondary">
            {t("pricing.priceType")}
          </span>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {(["fixed", "from", "on_request"] as const).map((value) => (
              <label
                key={value}
                className={`inline-flex items-center gap-2 rounded-pill border px-3.5 py-2 text-dash-caption font-bold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  priceType === value
                    ? "border-copper bg-copper/10 text-copper-strong"
                    : "border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"
                }`}
              >
                <input
                  type="radio"
                  name="priceType"
                  value={value}
                  checked={priceType === value}
                  onChange={() => onPriceTypeChange(value)}
                  className="invisible absolute"
                  aria-label={t(`priceType.${value}`)}
                />
                <span>{t(`priceType.${value}`)}</span>
              </label>
            ))}
          </div>
        </div>

        {!isRequest && (
          <Field
            id="service-price"
            label={t("pricing.price")}
            hint={t("pricing.priceHint")}
            error={priceError ?? undefined}
            required
          >
            <input
              id="service-price"
              dir="ltr"
              inputMode="decimal"
              value={price ?? ""}
              onChange={(event) => onPriceChange(event.target.value || null)}
              placeholder={t("pricing.pricePlaceholder")}
              aria-label={t("pricing.price")}
              className={inputClass(Boolean(priceError))}
            />
          </Field>
        )}

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <Field
            id="service-duration"
            label={t("pricing.duration")}
            hint={t("pricing.durationHint")}
          >
            <input
              id="service-duration"
              dir="ltr"
              inputMode="numeric"
              value={durationMin ?? ""}
              onChange={(event) =>
                onDurationMinChange(event.target.value || null)
              }
              placeholder={t("pricing.durationPlaceholder")}
              aria-label={t("pricing.duration")}
              className={inputClass(false)}
            />
          </Field>
          <Field
            id="service-sessions"
            label={t("pricing.sessions")}
            hint={t("pricing.sessionsHint")}
          >
            <input
              id="service-sessions"
              dir="ltr"
              inputMode="numeric"
              value={sessionsCount}
              onChange={(event) =>
                onSessionsCountChange(event.target.value.replace(/[^0-9]/g, ""))
              }
              aria-label={t("pricing.sessions")}
              className={inputClass(false)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-4">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("pricing.featured")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("pricing.featuredHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isFeatured}
            aria-label={t("pricing.featured")}
            onClick={onToggleFeatured}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isFeatured ? "bg-accent" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                isFeatured ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}
