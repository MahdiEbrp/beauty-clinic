"use client";

import { useTranslations } from "next-intl";
import { CalendarClock, Check, CreditCard, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "./types";

const STEP_ICONS = [Sparkles, CalendarClock, User, CreditCard] as const;

export default function Stepper({ current }: { current: WizardStep }) {
  const t = useTranslations("booking");

  const labels = [
    t("stepper.service"),
    t("stepper.schedule"),
    t("stepper.contact"),
    t("stepper.review"),
  ];

  return (
    <ol
      role="list"
      aria-label={t("stepper.label")}
      className="flex items-center gap-2"
    >
      {labels.map((label, index) => {
        const Icon = STEP_ICONS[index];
        const state = index < current ? "past" : index === current ? "current" : "upcoming";
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                state === "past" && "border-copper-deep bg-copper-deep text-content-contrast",
                state === "current" &&
                  "border-accent bg-accent text-content-contrast shadow-elevation-2",
                state === "upcoming" && "border-border-interactive bg-surface-secondary text-content-tertiary",
              )}
            >
              {state === "past" ? (
                <Check className="size-5" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Icon className="size-5" aria-hidden="true" />
              )}
            </span>
            <span className="sr-only md:not-sr-only md:shrink-0 md:text-caption md:font-semibold md:text-content-secondary">
              {label}
            </span>
            {index < labels.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1 transition-colors",
                  index < current ? "bg-copper-deep" : "bg-border-primary",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
