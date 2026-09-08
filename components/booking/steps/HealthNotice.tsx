"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Check, HeartPulse, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthNoticeProps = {
  pregnant: boolean;
  illness: boolean;
  phone: string;
  onChange: (kind: "pregnant" | "illness", value: boolean) => void;
};

/** Step-0 health gate: pregnant / specific-illness toggles block the flow. */
export function HealthNotice({ pregnant, illness, phone, onChange }: HealthNoticeProps) {
  const t = useTranslations("booking");
  const blocked = pregnant || illness;

  const toggle = (kind: "pregnant" | "illness") =>
    onChange(kind, kind === "pregnant" ? !pregnant : !illness);

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex min-h-11 w-full cursor-pointer select-none items-center gap-2 rounded-control border px-3 py-2 text-body-sm font-black transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      active ? "border-error bg-error/10 text-error" : "border-border-interactive bg-surface-primary text-content-secondary hover:border-copper",
    );

  return (
    <div
      className={cn(
        "rounded-panel border p-3.5 transition-colors sm:p-4",
        blocked ? "border-error/50 bg-error/5" : "border-border-primary/80 bg-surface-secondary/70 shadow-xs",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-control", blocked ? "bg-error text-content-contrast" : "bg-accent text-content-contrast")}>
            <HeartPulse className={cn("size-4", blocked ? "" : "text-copper-light")} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-body-sm font-black text-content-primary">{t("services.healthTitle")}</h3>
            <p className="text-caption text-content-tertiary">{t("services.healthSubtitle")}</p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <button type="button" role="checkbox" aria-checked={illness} onClick={() => toggle("illness")} className={pillClass(illness)}>
            <span aria-hidden="true" className={cn("flex size-5 shrink-0 items-center justify-center rounded border", illness ? "border-error bg-error text-content-contrast" : "border-border-interactive bg-surface-secondary")}>
              {illness ? <Check className="size-3" strokeWidth={3.5} /> : null}
            </span>
            <span>{t("services.healthIllness")}</span>
          </button>
          <button type="button" role="checkbox" aria-checked={pregnant} onClick={() => toggle("pregnant")} className={pillClass(pregnant)}>
            <span aria-hidden="true" className={cn("flex size-5 shrink-0 items-center justify-center rounded border", pregnant ? "border-error bg-error text-content-contrast" : "border-border-interactive bg-surface-secondary")}>
              {pregnant ? <Check className="size-3" strokeWidth={3.5} /> : null}
            </span>
            <span>{t("services.healthPregnant")}</span>
          </button>
        </div>
      </div>

      {blocked ? (
        <div role="alert" className="mt-3 flex flex-col items-start justify-between gap-2.5 rounded-control border border-error/40 bg-surface-primary p-3 animate-fade-in sm:flex-row sm:items-center">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
            <div>
              <p className="text-body-sm font-black text-error">{t("services.healthBlockedTitle")}</p>
              <p className="mt-0.5 text-caption leading-relaxed text-content-secondary">{t("services.healthBlockedDesc")}</p>
            </div>
          </div>
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="inline-flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-accent px-4 text-body-sm font-black text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            <PhoneCall className="size-4 text-copper-light" aria-hidden="true" />
            <span dir="ltr">{phone}</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}