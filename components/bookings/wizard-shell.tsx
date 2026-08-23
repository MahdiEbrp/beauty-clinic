"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export interface WizardStep {
  key: string;
  labelKey: string;
}

export function WizardShell({
  namespace,
  backHref,
  title,
  steps,
  step,
  onStep,
  canContinue,
  submitting,
  mode,
  onSubmit,
  children,
}: {
  namespace: string;
  backHref: string;
  title: string;
  steps: WizardStep[];
  step: number;
  onStep: (next: number) => void;
  canContinue: boolean;
  submitting: boolean;
    mode: "create" | "edit";
  onSubmit: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const total = steps.length;
  const isLast = step >= total - 1;

  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
        <span>{t("bookingAdmin.back")}</span>
      </Link>

      <header className="rounded-panel border border-border-primary bg-surface-secondary px-5 py-4 shadow-elevation-2 sm:px-6">
        <h1 className="text-dash-title font-bold tracking-tight text-accent">{title}</h1>
        <p className="mt-1 text-dash-caption text-content-tertiary">
          {t(`${namespace}.nav.stepOf`, { current: step + 1, total })}
        </p>
      </header>

      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((item, index) => (
          <li key={item.key}>
            <button
              type="button"
              disabled={index > step}
              onClick={() => onStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-pill border px-3 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none ${
                index === step
                  ? "border-accent bg-accent text-content-contrast"
                  : index < step
                    ? "border-border-primary bg-surface-tertiary text-content-secondary"
                    : "border-border-primary bg-surface-secondary text-content-tertiary opacity-60"
              }`}
            >
              {index + 1}. {t(item.labelKey)}
            </button>
          </li>
        ))}
      </ol>

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
            <ArrowLeft className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
            {t("common.back")}
          </button>

          <div className="flex items-center gap-3">
            {!isLast && (
              <Link href={backHref} className="text-dash-body-sm font-bold text-content-secondary hover:text-accent">
                {t("common.cancel")}
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
                  ? t(`${namespace}.submit.create`)
                  : t(`${namespace}.submit.save`)}
              </button>
            ) : (
                            <button
                type="submit"
                disabled={!canContinue}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t(`${namespace}.nav.continue`)}
                <ArrowRight className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
