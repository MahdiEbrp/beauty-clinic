"use client";

import { useTranslations } from "next-intl";
import { Sparkles, CalendarPlus, Eye } from "lucide-react";

export default function Hero() {
  const t = useTranslations();

  return (
    <section
      id="home"
      className="hero-bg min-h-dvh flex items-center relative pt-24 overflow-hidden"
    >
      <div className="hero-overlay absolute inset-0 z-0" />

      <div className="relative z-10 w-full max-w-content mx-auto px-6">
        <div className="max-w-full animate-slide-up">
          {/* copper-strong, not copper: at 12px this is normal-size text and
              needs the full 4.5:1 ratio. */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary/90 backdrop-blur-sm border border-border-primary rounded-pill text-caption font-semibold text-copper-strong mb-8 shadow-elevation-1">
            <Sparkles className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span>{t("hero.tagline")}</span>
          </div>

          <h1 className="text-[var(--text-display)] font-extralight mb-6 leading-[1.1] tracking-tight text-accent">
            {t("hero.heading1")}
            <br />
            <b className="bg-linear-to-br from-accent to-copper bg-clip-text text-transparent">
              {t("hero.heading2")}
            </b>
          </h1>

          <p className="text-[var(--text-body-lead)] max-w-lg mb-12 leading-normal text-content-secondary">
            {t("hero.description")}
          </p>

          <div className="flex gap-4 flex-wrap">
            <a
              id="hero-cta"
              href="#contact"
              className="btn-hero-primary inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-accent text-content-contrast rounded-pill font-bold no-underline border border-copper transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
            >
              <CalendarPlus className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
              {t("hero.cta1")}
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-transparent text-accent border-2 border-border-interactive rounded-pill font-bold no-underline transition-all duration-300 hover:border-accent hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Eye className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
              {t("hero.cta2")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
