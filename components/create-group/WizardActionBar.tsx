"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function WizardActionBar({
  step,
  total,
  submitting,
  onBack,
  onPrimary,
}: {
  step: number;
  total: number;
  submitting: boolean;
  onBack: () => void;
  onPrimary: () => void;
}) {
  const t = useTranslations("groupWizard");
  const isLastStep = step === total;

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={step === 1 || submitting}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-5 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45 ${
          step === 1 ? "invisible" : ""
        }`}
      >
        <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" />
        <span className="hidden sm:inline">{t("nav.back")}</span>
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={submitting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-dash-body-sm font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60 sm:px-8"
      >
        {submitting && isLastStep && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {isLastStep ? t("nav.create") : t("nav.continue")}
        {!isLastStep && (
          <ChevronRight className="size-4 rtl-mirror" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
