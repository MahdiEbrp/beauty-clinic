"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { asTranslate } from "@/src/i18n/message-key";
import { Link } from "@/src/i18n/navigation";
import { Check, ChevronDown, ChevronLeft, Languages } from "lucide-react";

import { STEPS } from "./helpers";
import type { Locale } from "./types";

export default function WizardHeader({
  step,
  currentStepKey,
  total,
  lang,
  langAware,
  heading,
  subtitle,
  onLangChange,
  onGoTo,
  ns = "groupWizard",
  steps = STEPS,
  backHref = "/dashboard/services/manage/groups",
}: {
  step: number;
  currentStepKey: string;
  total: number;
  lang: Locale;
  langAware: boolean;
  heading?: string;
  subtitle?: string;
  onLangChange: (value: Locale) => void;
  onGoTo: (next: number) => void;
  ns?: MessageNamespace;
  steps?: ReadonlyArray<{ id: number; key: string }>;
  backHref?: string;
}) {
  const t = useTranslations(ns);
  const stepName = asTranslate(t);
  const progress = Math.round((step / total) * 100);

  return (
    <header className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-dash-body-sm font-semibold text-content-secondary no-underline transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" />
          {t("back")}
        </Link>
        <div className="space-y-1">
          <h1 className="text-dash-display font-bold tracking-tight text-accent">
            {heading ?? t("heading")}
          </h1>
          <p className="max-w-2xl text-dash-body text-content-secondary">
            {subtitle ?? t("subtitle")}
          </p>
        </div>
      </div>

      <div className="rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2 rounded-full ${step === 5 ? "bg-success" : "bg-copper"}`}
              aria-hidden="true"
            />
            <h2 className="text-dash-title font-bold tracking-tight text-content-primary">
              {stepName(`steps.${currentStepKey}.name`)}
            </h2>
          </div>
          <span className="text-dash-caption font-semibold text-content-tertiary">
            {t("nav.stepOf", { current: step, total })}
          </span>
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-pill bg-surface-tertiary"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={stepName(`steps.${currentStepKey}.name`)}
        >
          <div
            className="h-full rounded-pill bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {langAware && (
          <div className="mt-4 flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-control border border-border-primary bg-surface-primary px-3 py-1.5">
              <Languages
                className="size-4 text-copper-strong"
                aria-hidden="true"
              />
              <label htmlFor="wizard-lang" className="sr-only">
                {t("language.label")}
              </label>
              <SelectPrimitive.Root
                value={lang}
                onValueChange={(value) => onLangChange(value as Locale)}
              >
                <SelectPrimitive.Trigger
                  id="wizard-lang"
                  aria-label={t("language.label")}
                  className="inline-flex min-h-9 items-center justify-between gap-2 rounded-control bg-transparent px-2 text-dash-body-sm font-semibold text-content-primary outline-none transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[state=open]:bg-surface-tertiary"
                >
                  <SelectPrimitive.Value />
                  <SelectPrimitive.Icon asChild>
                    <ChevronDown
                      className="size-3.5 text-content-tertiary"
                      aria-hidden="true"
                    />
                  </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content
                    position="popper"
                    sideOffset={4}
                    className="z-50 min-w-32 overflow-hidden rounded-control border border-border-primary bg-surface-secondary p-1 text-accent shadow-elevation-3"
                  >
                    <SelectPrimitive.Viewport>
                      <SelectPrimitive.Item
                        value="en"
                        className="relative flex min-h-10 cursor-pointer select-none items-center rounded-control px-3 pe-9 text-dash-body-sm outline-none transition-colors focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary"
                      >
                        <SelectPrimitive.ItemText>
                          {t("language.en")}
                        </SelectPrimitive.ItemText>
                        <SelectPrimitive.ItemIndicator className="absolute inset-e-2.5">
                          <Check className="size-4 text-copper-strong" aria-hidden="true" />
                        </SelectPrimitive.ItemIndicator>
                      </SelectPrimitive.Item>
                      <SelectPrimitive.Item
                        value="fa"
                        className="relative flex min-h-10 cursor-pointer select-none items-center rounded-control px-3 pe-9 text-dash-body-sm outline-none transition-colors focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary"
                      >
                        <SelectPrimitive.ItemText>
                          {t("language.fa")}
                        </SelectPrimitive.ItemText>
                        <SelectPrimitive.ItemIndicator className="absolute inset-e-2.5">
                          <Check className="size-4 text-copper-strong" aria-hidden="true" />
                        </SelectPrimitive.ItemIndicator>
                      </SelectPrimitive.Item>
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>
          </div>
        )}

        <nav
          aria-label={t("heading")}
          className="mt-4 flex items-center gap-1 sm:gap-2"
        >
          {steps.map(({ id, key }) => {
            const isActive = id === step;
            const isCompleted = id < step;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onGoTo(id)}
                aria-current={isActive ? "step" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-pill text-dash-caption font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive
                    ? "bg-accent text-content-contrast"
                    : isCompleted
                      ? "text-copper-strong hover:bg-surface-tertiary"
                      : "text-content-tertiary hover:bg-surface-tertiary"
                }`}
              >
                <span className="flex size-5 items-center justify-center rounded-pill border border-current text-[10px] font-bold">
                  {isCompleted ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    id
                  )}
                </span>
                <span className="hidden sm:inline">{stepName(`steps.${key}.name`)}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
