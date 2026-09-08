"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, BookOpen, CheckCircle2, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicRule } from "@/lib/services/rules-types";

type TermsPanelProps = {
  rules: PublicRule[];
  accepted: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
  onReadRules: () => void;
};

/** Terms & clinic-rules consent block with live accepted / error state. */
export function TermsPanel({ rules, accepted, error, onChange, onReadRules }: TermsPanelProps) {
  const t = useTranslations("booking");

  return (
    <div className={cn("space-y-3 rounded-panel border-2 p-4 transition-all", error ? "border-error bg-error/5" : accepted ? "border-copper/60 bg-surface-primary shadow-sm" : "border-copper/40 bg-surface-primary")}>
      <div className="flex items-center justify-between gap-2 text-body-sm">
        <span className="flex items-center gap-2 font-black text-accent">
          <BookOpen className="size-5 shrink-0 text-copper" aria-hidden="true" />
          {t("summary.rulesTitle")}
        </span>
        <button
          type="button"
          onClick={onReadRules}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-caption font-black text-copper underline hover:text-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <FileCheck className="size-3.5" aria-hidden="true" />
          {t("summary.readFullRules")}
        </button>
      </div>

      {rules.length > 0 ? (
        <div className="space-y-2 rounded-control border border-copper/25 bg-copper/5 p-3 text-body-sm">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-start gap-2">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-copper" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-extrabold leading-relaxed text-content-primary">{rule.name}</p>
                {rule.description ? (
                  <p className="mt-0.5 line-clamp-2 text-caption leading-relaxed text-content-secondary">{rule.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <label className="flex cursor-pointer select-none items-center justify-between gap-2 pt-1">
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => onChange(event.target.checked)}
            className="size-4 shrink-0 cursor-pointer accent-accent"
          />
          <span className="text-body-sm font-black text-content-primary">{t("summary.acceptTerms")}</span>
        </span>
        {accepted ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-success/10 px-2.5 py-0.5 text-caption font-black text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {t("summary.accepted")}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-pill bg-error/10 px-2.5 py-0.5 text-caption font-black text-error">
            {t("summary.required")}
          </span>
        )}
      </label>

      {error ? (
        <p className="flex items-center gap-1 text-caption font-black text-error">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}