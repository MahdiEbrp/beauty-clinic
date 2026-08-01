"use client";

import { useTranslations } from "next-intl";
import {
  Droplets,
  Zap,
  Flower2,
  Dumbbell,
  WandSparkles,
  Leaf,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  gelBotox: Droplets,
  facial: Flower2,
  rejuvenation: WandSparkles,
  bodyFiller: Dumbbell,
  hifu: Zap,
  microneedling: Leaf,
};

const serviceKeys = [
  "gelBotox",
  "facial",
  "rejuvenation",
  "bodyFiller",
  "hifu",
  "microneedling",
] as const;

export default function ServiceDetailCards() {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {serviceKeys.map((key) => {
        const Icon = iconMap[key] ?? Droplets;

        return (
          <article
            key={key}
            className="bg-surface-secondary border border-border-primary rounded-panel p-8 relative overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-2 hover:shadow-elevation-3 hover:border-transparent hover:bg-surface-tertiary group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-surface-primary text-copper rounded-control flex items-center justify-center transition-all duration-300 shrink-0 group-hover:bg-accent group-hover:text-content-contrast group-hover:scale-110 group-hover:-rotate-12">
                <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="text-heading-3 font-bold m-0 text-accent">
                {t(`servicesPage.services.${key}.title`)}
              </h3>
            </div>
            <p className="mt-auto text-body-sm text-content-secondary leading-relaxed">
              {t(`servicesPage.services.${key}.description`)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
