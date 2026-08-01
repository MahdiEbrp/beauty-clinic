"use client";

import { useTranslations } from "next-intl";
import { getServices, serviceIconMap } from "@/data/services";
import Reveal from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export default function Services() {
  const t = useTranslations();
  const services = getServices();

  return (
    <section id="services" className="py-24 relative bg-surface-primary">
      {/* Decorative gradient divider between marquee and services */}
      <div className="rule-gradient max-w-content mx-auto mb-24" aria-hidden="true" />

      <div className="relative max-w-content mx-auto px-6">
        <Reveal direction="start">
          <div className="mb-16 max-w-prose">
            <h2 className="text-heading-1 mb-4 text-accent">
              {t("services.heading")}
            </h2>
            <p className="text-content-secondary">{t("services.description")}</p>
          </div>
        </Reveal>

        <Stagger
          stagger={0.1}
          className="grid grid-cols-12 gap-6"
        >
          {services.map((service, index) => {
            const Icon = serviceIconMap[service.key];
            // First card is the feature tile: full height.
            const isFeature = index === 0;

            return (
              <StaggerItem
                key={service.key}
                direction="up"
                className={`col-span-12 md:col-span-6 ${
                  isFeature ? "md:row-span-2" : ""
                }`}
              >
                <article className="bg-surface-secondary border border-border-primary rounded-panel p-8 relative overflow-hidden transition-all duration-300 flex flex-col h-full hover:-translate-y-2 hover:shadow-elevation-3 hover:border-transparent hover:bg-surface-tertiary group">
                  {/* Subtle glow on hover */}
                  <div
                    className="absolute -top-16 -inset-s-16 w-48 h-48 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="glow-accent w-full h-full" />
                  </div>

                  <div className="relative flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-surface-primary text-copper rounded-control flex items-center justify-center transition-all duration-300 shrink-0 group-hover:bg-accent group-hover:text-content-contrast group-hover:scale-110 group-hover:-rotate-12">
                      <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                    </div>
                    <h3 className="text-heading-3 font-bold m-0 text-accent">
                      {t(`${service.tKey}.title`)}
                    </h3>
                  </div>
                  <p className="mt-auto text-body-sm text-content-secondary relative">
                    {t(`${service.tKey}.description`)}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
