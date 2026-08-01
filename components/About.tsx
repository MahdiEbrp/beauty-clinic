"use client";

import { useTranslations } from "next-intl";
import { stats } from "@/data/stats";

export default function About() {
  const t = useTranslations();

  return (
    <section id="about" className="py-24 relative bg-surface-primary">
      <div className="relative max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-feature p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 items-center shadow-elevation-1">
          <div>
            <h2 className="text-heading-1 mb-6 text-accent">
              {t("about.heading1")}
              <br />
              {t("about.heading2")}
            </h2>
            <p className="text-body-lead text-content-secondary">
              {t("about.description")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border-primary pt-8 mt-8 md:mt-0 md:border-s md:border-t-0 md:ps-8 md:pt-0">
            {stats.map((stat) => (
              <div key={stat.key}>
                <h3 className="text-heading-2 text-copper font-extrabold mb-1 ">
                  {stat.value.toLocaleString("en")}
                  {stat.plus ? "+" : ""}
                </h3>
                <span className="text-caption text-content-secondary block">
                  {t(`about.${stat.key}Label`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
