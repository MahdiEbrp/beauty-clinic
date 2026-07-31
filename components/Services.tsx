"use client";

import { useTranslations } from "next-intl";
import { getServices, serviceIconMap } from "@/data/services";

export default function Services() {
  const t = useTranslations();
  const services = getServices();

  return (
    <section id="services" className="py-24 relative bg-surface-primary">
      <div className="relative max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h2 className="text-[clamp(2rem,6vw,3.5rem)] mb-4 text-accent">
            {t("services.heading")}
          </h2>
          <p className="text-content-secondary">{t("services.description")}</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {services.map((service, index) => {
            const Icon = serviceIconMap[service.key];
            // The first card is the feature tile: full height on the left.
            const isFeature = index === 0;

            return (
              <article
                key={service.key}
                className={`col-span-12 md:col-span-6 bg-surface-secondary border border-border-primary rounded-panel p-8 relative overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-2 hover:shadow-elevation-3 hover:border-transparent hover:bg-surface-tertiary group ${
                  isFeature ? "md:row-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-surface-primary text-copper rounded-control flex items-center justify-center transition-all duration-300 shrink-0 group-hover:bg-accent group-hover:text-content-contrast group-hover:scale-110 group-hover:-rotate-12">
                    <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3 className="text-[clamp(1.25rem,4vw,1.5rem)] font-bold m-0 text-accent">
                    {t(`${service.tKey}.title`)}
                  </h3>
                </div>
                <p className="mt-auto text-sm text-content-secondary">
                  {t(`${service.tKey}.description`)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
