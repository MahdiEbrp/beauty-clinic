"use client";

import { useTranslations, useLocale } from "next-intl";
import { stats } from "@/data/stats";

export default function About() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section id="about" className="py-24 relative bg-surface-primary">
      <div className="relative max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-feature p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 items-center shadow-elevation-1">
          <div>
            <h2 className="text-[clamp(2rem,6vw,3.5rem)] mb-6 text-accent">
              {t("about.heading1")}
              <br />
              {t("about.heading2")}
            </h2>
            <p className="text-[clamp(1.25rem,4vw,1.5rem)] text-content-secondary">
              {t("about.description")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border-primary pt-8 mt-8 md:mt-0 md:border-s md:border-t-0 md:ps-8 md:pt-0">
            {stats.map((stat) => {
              const formatted = new Intl.NumberFormat(locale, {
                notation: stat.compact ? "compact" : "standard",
                maximumFractionDigits: 0,
              }).format(stat.value);

              return (
                <div key={stat.key}>
                  {/* `num-intl` disables the global ss01 glyph substitution:
                      Intl already emitted real Persian-Indic digits, and running
                      both conversions on one element is forbidden by
                      DESIGN_RULES #74. */}
                  <h3 className="num-intl text-[clamp(1.5rem,4.5vw,2.25rem)] text-copper font-extrabold mb-1 tabular-nums">
                    {formatted}
                    {stat.plus ? "+" : ""}
                  </h3>
                  <span className="text-xs text-content-secondary block">
                    {t(`about.${stat.key}Label`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
