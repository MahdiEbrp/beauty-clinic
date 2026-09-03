"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { msgKey, asTranslate, type MessageKey, type MessageNamespace } from "@/src/i18n/message-key";

export interface WizardStep {
  key: string;
  labelKey: MessageKey;
}

export function WizardShell({
  namespace,
  backHref,
  title,
  subtitle,
  steps,
  step,
  onStep,
  canContinue,
  submitting,
  mode,
  onSubmit,
  children,
}: {
  namespace: MessageNamespace;
  backHref: string;
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  step: number;
  onStep: (next: number) => void;
  canContinue: boolean;
  submitting: boolean;
  mode: "create" | "edit";
  onSubmit: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const t = useTranslations(namespace);
  const tRoot = useTranslations();
  const stepName = asTranslate(t);
  const total = steps.length;
  const isLast = step >= total - 1;
  const progress = Math.round(((step + 1) / total) * 100);

  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-1.5 self-start text-dash-body-sm font-semibold text-content-secondary no-underline transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
        {tRoot("bookingAdmin.back")}
      </Link>

      <header className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-dash-display font-bold tracking-tight text-accent">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-dash-body text-content-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      <div className="rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="size-2 rounded-full bg-copper"
              aria-hidden="true"
            />
            <h2 className="text-dash-title font-bold tracking-tight text-content-primary">
              {stepName(`steps.${steps[step]?.key}.name`)}
            </h2>
          </div>
          <span className="text-dash-caption font-semibold text-content-tertiary">
            {tRoot(msgKey(`${namespace}.nav.stepOf`), { current: step + 1, total })}
          </span>
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-pill bg-surface-tertiary"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={stepName(`steps.${steps[step]?.key}.name`)}
        >
          <div
            className="h-full rounded-pill bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <nav
          aria-label={title}
          className="mt-4 flex items-center gap-1 sm:gap-2"
        >
          {steps.map((item, index) => {
            const isActive = index === step;
            const isCompleted = index < step;
            return (
              <button
                key={item.key}
                type="button"
                disabled={index > step}
                onClick={() => onStep(index)}
                aria-current={isActive ? "step" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-pill text-dash-caption font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none ${
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
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{stepName(`steps.${item.key}.name`)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (isLast) {
            if (!submitting) void onSubmit();
          } else if (canContinue) {
            onStep(step + 1);
          }
        }}
        className="space-y-4"
      >
        <div className="rounded-card border border-border-primary bg-surface-secondary p-5 shadow-elevation-1">
          {children}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onStep(Math.max(0, step - 1))}
            disabled={step === 0 || submitting}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
            {tRoot("common.back")}
          </button>

          <div className="flex items-center gap-3">
            {!isLast && (
              <Link href={backHref} className="text-dash-body-sm font-bold text-content-secondary hover:text-accent">
                {tRoot("common.cancel")}
              </Link>
            )}
            {isLast ? (
              <button
                type="submit"
                disabled={submitting || !canContinue}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "create"
                  ? tRoot(msgKey(`${namespace}.submit.create`))
                  : tRoot(msgKey(`${namespace}.submit.save`))}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canContinue}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {tRoot(msgKey(`${namespace}.nav.continue`))}
                <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
