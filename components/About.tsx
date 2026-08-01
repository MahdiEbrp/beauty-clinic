"use client";

import { useTranslations } from "next-intl";
import { stats } from "@/data/stats";
import Reveal from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import Counter from "@/components/motion/counter";

export default function About() {
  const t = useTranslations();

  return (
    <section id="about" className="py-24 relative bg-surface-primary overflow-hidden">
      <div className="rule-gradient max-w-content mx-auto mb-24" aria-hidden="true" />

      <div className="relative max-w-content mx-auto px-6">
        <Reveal direction="end">
          <div className="bg-surface-secondary border border-border-primary rounded-feature p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 items-center shadow-elevation-1 relative overflow-hidden">
            {/* Decorative glow orb behind stats */}
            <div
              className="absolute -bottom-20 -inset-e-20 w-80 h-80 rounded-full animate-float-slower opacity-30 pointer-events-none"
              aria-hidden="true"
            >
              <div className="glow-gold w-full h-full" />
            </div>

            {/* Grain texture inside the card */}
            <div className="grain absolute inset-0 rounded-feature pointer-events-none" aria-hidden="true" />

            <div className="relative">
              <h2 className="text-heading-1 mb-6 text-accent">
                {t("about.heading1")}
                <br />
                {t("about.heading2")}
              </h2>
              <p className="text-body-lead text-content-secondary">
                {t("about.description")}
              </p>
            </div>

            <Stagger
              stagger={0.12}
              once
              className="grid grid-cols-3 gap-4 border-t border-border-primary pt-8 mt-8 md:mt-0 md:border-s md:border-t-0 md:ps-8 md:pt-0 relative"
            >
              {stats.map((stat) => (
                <StaggerItem key={stat.key} direction="up" distance={16}>
                  <div>
                    <h3 className="text-heading-2 text-copper font-extrabold mb-1">
                      <Counter
                        value={stat.value}
                        compact={stat.compact}
                        plus={stat.plus}
                        className="inline-block"
                      />
                    </h3>
                    <span className="text-caption text-content-secondary block">
                      {t(`about.${stat.key}Label`)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
