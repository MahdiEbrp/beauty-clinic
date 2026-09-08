"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "./types";

type BottomBarProps = {
  /** The active wizard step (0–2, hidden on the confirmation step). */
  step: WizardStep;
  /** Whether "next" is currently allowed. */
  canProceed: boolean;
  onNext: () => void;
  onPrev: () => void;
};

/** Sticky bottom action bar (Template parity) shown on steps 0–2. */
export default function BottomBar({ step, canProceed, onNext, onPrev }: BottomBarProps) {
  const t = useTranslations("booking");

  if (step === 3) return null;

  const nextLabel =
    step === 0
      ? t("sidebar.nextSchedule")
      : step === 1
        ? t("sidebar.nextContact")
        : t("sidebar.nextReview");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-primary bg-surface-secondary/95 px-3 py-3.5 shadow-elevation-3 backdrop-blur-md sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={onPrev}
          className={cn(
            "inline-flex min-h-13 select-none items-center gap-2 rounded-control px-6 text-body font-black transition-all sm:px-8",
            step === 0
              ? "cursor-not-allowed border border-border-primary/40 bg-surface-tertiary/40 text-content-tertiary/40 opacity-50"
              : "cursor-pointer border border-border-interactive bg-surface-primary text-content-primary shadow-elevation-1 hover:bg-surface-tertiary hover:text-accent active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          <ArrowLeft className="rtl-mirror size-4 sm:size-5" aria-hidden="true" />
          <span>{t("bottomBar.back")}</span>
        </button>

        {step === 2 ? (
          <span className="hidden items-center gap-1.5 text-caption text-content-tertiary xs:inline-flex">
            <ShieldCheck className="size-3.5 text-copper" aria-hidden="true" />
            {t("bottomBar.summaryNote")}
          </span>
        ) : (
          <button
            type="button"
            disabled={!canProceed}
            onClick={onNext}
            className={cn(
              "inline-flex min-h-13 select-none items-center gap-2 rounded-control px-6 text-body font-black shadow-elevation-1 transition-all sm:px-8",
              canProceed
                ? "cursor-pointer bg-accent text-content-contrast hover:bg-accent-hover active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                : "cursor-not-allowed bg-surface-tertiary text-content-tertiary opacity-60",
            )}
          >
            <span>{nextLabel}</span>
            <ArrowRight className="rtl-mirror size-4 sm:size-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}