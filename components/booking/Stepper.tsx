"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  /** 0-based index of the active step. */
  current: number;
  /** Whether each step index can be navigated back to. */
  canStepTo: (index: number) => boolean;
  onStepClick: (index: number) => void;
  onOpenMyBookings?: () => void;
  bookingsCount?: number;
};

const STEP_LABELS = ["service", "schedule", "review", "confirmation"] as const;

/**
 * Sticky full-width top progress bar (Template parity). Shows the step badge,
 * current-step title, the "my bookings" quick link, the completion percentage
 * and 4 milestone buttons arranged along the progress line.
 */
export default function Stepper({
  current,
  canStepTo,
  onStepClick,
  onOpenMyBookings,
  bookingsCount = 0,
}: StepperProps) {
  const t = useTranslations("booking");
  const total = STEP_LABELS.length;
  const percent = Math.round(((current + 1) / total) * 100);

  return (
    <header className="sticky top-20 z-40 w-full border-b border-border-primary bg-surface-secondary px-3 py-3 shadow-elevation-1 backdrop-blur-md sm:px-6">
      <div className="mx-auto max-w-4xl space-y-2.5">
        {/* Top header row: step badge + title (right), actions + percent (left) */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-3 py-1 text-xs font-black tracking-wide text-content-contrast shadow-elevation-1">
              {t("stepper.stepOf", { n: current + 1, total })}
            </span>
            <h1 className="truncate text-sm font-extrabold text-content-primary sm:text-sm">
              {t(`stepper.${STEP_LABELS[current]}`)}
            </h1>
          </div>

          <div className="ms-auto flex items-center gap-2">
            {/* My bookings quick link */}
            {onOpenMyBookings ? (
              <button
                type="button"
                onClick={onOpenMyBookings}
                className="hidden cursor-pointer items-center gap-1 rounded-full border border-border-interactive bg-surface-primary px-2.5 py-1 text-[11px] font-bold text-content-secondary transition-colors hover:text-content-primary md:flex"
              >
                <span>{t("myBookings.open")}</span>
                {bookingsCount > 0 ? (
                  <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-content-contrast">
                    {bookingsCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            {/* Completion percentage capsule */}
            <div className="flex shrink-0 items-center rounded-full border border-border-interactive bg-surface-primary px-3 py-1 text-xs font-bold text-content-primary shadow-elevation-1">
              {t("stepper.completed", { p: percent })}
            </div>
          </div>
        </div>

        {/* Progress line with milestone buttons */}
        <div className="pb-1 pt-0.5">
          <div className="h-2 w-full overflow-hidden rounded-full border border-border-primary/40 bg-surface-tertiary">
            <div
              className="h-full rounded-full bg-linear-to-r from-copper to-accent transition-all duration-300 ease-out"
              style={{ width: `${Math.max(12, percent)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            {STEP_LABELS.map((label, index) => {
              const isCompleted = current > index;
              const isCurrent = current === index;
              const clickable = canStepTo(index);

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => clickable && onStepClick(index)}
                  disabled={!clickable}
                  className={cn(
                    "flex select-none items-center gap-1.5 rounded-lg p-1 text-xs font-bold transition-all",
                    clickable ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                    isCurrent
                      ? "font-extrabold text-accent"
                      : isCompleted
                        ? "text-copper-deep hover:text-content-primary"
                        : "text-content-secondary hover:text-content-primary",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-colors",
                      isCurrent
                        ? "bg-accent text-content-contrast shadow-elevation-1 ring-2 ring-copper/30"
                        : isCompleted
                          ? "bg-copper-deep text-content-contrast"
                          : "border border-border-primary bg-surface-tertiary text-content-secondary",
                    )}
                  >
                    {isCompleted ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="hidden max-w-17.5 truncate text-[11px] xs:inline sm:inline sm:max-w-none sm:text-xs">
                    {t(`stepper.${label}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
