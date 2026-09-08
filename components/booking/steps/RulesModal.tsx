"use client";

import { useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, Clock, Receipt, ShieldCheck, Sparkles, X } from "lucide-react";

type RulesModalProps = {
  onAccept: () => void;
  onClose: () => void;
};

const RULES = [
  { icon: Clock, titleKey: "summary.rules.s1Title", bodyKey: "summary.rules.s1Body" },
  { icon: Receipt, titleKey: "summary.rules.s2Title", bodyKey: "summary.rules.s2Body" },
  { icon: ShieldCheck, titleKey: "summary.rules.s3Title", bodyKey: "summary.rules.s3Body" },
  { icon: Sparkles, titleKey: "summary.rules.s4Title", bodyKey: "summary.rules.s4Body" },
] as const;

/** Full clinic booking charter (Template parity) shown from the terms strip. */
export default function RulesModal({ onAccept, onClose }: RulesModalProps) {
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
          <div className="rounded-control border border-border-interactive bg-surface-tertiary/70 p-3 text-caption font-medium leading-relaxed text-copper-strong">
            {t("summary.rules.intro")}
          </div>

          {RULES.map((rule) => (
            <div key={rule.titleKey} className="space-y-1.5 rounded-control border border-border-primary bg-surface-secondary p-3.5">
              <h4 className="flex items-center gap-2 text-body-sm font-black text-accent">
                <rule.icon className="size-4 shrink-0 text-copper" aria-hidden="true" />
                {t(rule.titleKey)}
              </h4>
              <p className="text-caption leading-relaxed text-content-secondary">{t(rule.bodyKey)}</p>
            </div>
          ))}
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