"use client";

import { useTranslations } from "next-intl";
import {
  Clock,
  Sparkles,
  Car,
  Users,
  Hourglass,
  CalendarX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clinicRules } from "@/data/clinic-rules";

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  sparkles: Sparkles,
  car: Car,
  users: Users,
  hourglass: Hourglass,
  calendarX: CalendarX,
};

export default function RulesContent() {
  const t = useTranslations();

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h1 className="text-[var(--text-heading-1)] mb-4 text-accent">
            {t("rules.heading")}
          </h1>
          <p className="text-content-secondary">
            {t("rules.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clinicRules.map((rule) => {
            const Icon = iconMap[rule.iconKey] ?? Clock;

            return (
              <article
                key={rule.titleKey}
                className="bg-surface-secondary border border-border-primary rounded-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-surface-primary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
                    <Icon
                      className="w-6 h-6"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2 className="text-body-lg font-bold text-accent mb-2">
                      {t(`rules.${rule.titleKey}`)}
                    </h2>
                    <p className="text-body-sm text-content-secondary leading-relaxed">
                      {t(`rules.${rule.descriptionKey}`)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
