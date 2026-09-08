"use client";

import { useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, X } from "lucide-react";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { cn } from "@/lib/utils";
import type { PublicRule } from "@/lib/services/rules-types";

type RulesModalProps = {
  rules: PublicRule[];
  onAccept: () => void;
  onClose: () => void;
};

/** Clinic booking charter fed by the DB rules table (Template parity). */
export default function RulesModal({ rules, onAccept, onClose }: RulesModalProps) {
  const t = useTranslations("booking");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("summary.rules.title")}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-elevation-4">
        <div className="flex items-center justify-between gap-3 border-b border-border-primary bg-accent p-4 text-content-contrast">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-5 shrink-0 text-copper-light" aria-hidden="true" />
            <div>
              <h3 className="text-body font-black">{t("summary.rules.title")}</h3>
              <span className="block text-caption text-copper-light">{t("summary.rules.subtitle")}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("summary.rules.close")}
            className="flex size-10 cursor-pointer items-center justify-center rounded-control text-content-contrast/80 transition-colors hover:bg-white/10 hover:text-content-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4 sm:p-6">
          {rules.length === 0 ? (
            <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-8 text-center text-caption text-content-tertiary">
              {t("summary.rules.empty")}
            </p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={cn("space-y-1.5 rounded-control border p-3.5", rule.highlighted ? "border-copper/60 bg-copper/5" : "border-border-primary bg-surface-secondary")}
              >
                <h4 className="flex flex-wrap items-center gap-2 text-body-sm font-black text-accent">
                  <GroupGlyph name={rule.icon ?? "Sparkles"} className="size-4 shrink-0 text-copper" />
                  {rule.name}
                  {rule.highlighted ? (
                    <span className="rounded-pill bg-copper/15 px-2 py-0.5 text-caption font-black text-copper-deep">{t("summary.rules.highlighted")}</span>
                  ) : null}
                </h4>
                {rule.description ? (
                  <p className="text-caption leading-relaxed text-content-secondary">{rule.description}</p>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-primary bg-surface-secondary p-4 sm:flex-row">
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex min-h-12 w-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-5 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            <CheckCircle2 className="size-4 text-copper-light" aria-hidden="true" />
            {t("summary.rules.accept")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-control border border-border-interactive bg-surface-primary px-5 text-body-sm font-bold text-content-primary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            {t("summary.rules.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}