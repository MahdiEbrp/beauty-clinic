"use client";

import { useTranslations } from "next-intl";
import CareAccordion from "@/components/CareAccordion";
import { Separator } from "@/components/ui/separator";
import { preCareInstructions, postCareInstructions, durabilityPoints } from "@/data/care";
import {
  ShieldCheck,
  Heart,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function CareContent() {
  const t = useTranslations();

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h1 className="text-[var(--text-heading-1)] mb-4 text-accent">
            {t("care.heading")}
          </h1>
          <p className="text-content-secondary">
            {t("care.description")}
          </p>
        </div>

        <div className="space-y-16">
          <article>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-surface-secondary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
                <ShieldCheck
                  className="w-6 h-6"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 className="text-[var(--text-heading-2)] font-bold text-accent">
                  {t("care.preCare.heading")}
                </h2>
                <p className="text-body-sm text-content-secondary">
                  {t("care.preCare.description")}
                </p>
              </div>
            </div>
            <CareAccordion
              items={preCareInstructions}
              namespace="care.preCare"
            />
          </article>

          <Separator className="bg-border-primary" />

          <article>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-surface-secondary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
                <Heart
                  className="w-6 h-6"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 className="text-[var(--text-heading-2)] font-bold text-accent">
                  {t("care.postCare.heading")}
                </h2>
                <p className="text-body-sm text-content-secondary">
                  {t("care.postCare.description")}
                </p>
              </div>
            </div>
            <CareAccordion
              items={postCareInstructions}
              namespace="care.postCare"
            />
          </article>

          <Separator className="bg-border-primary" />

          <article>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-surface-secondary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
                <Clock
                  className="w-6 h-6"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 className="text-[var(--text-heading-2)] font-bold text-accent">
                  {t("care.durability.heading")}
                </h2>
                <p className="text-body-sm text-content-secondary">
                  {t("care.durability.description")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {durabilityPoints.map((point) => (
                <div
                  key={point.titleKey}
                  className="bg-surface-secondary border border-border-primary rounded-panel p-6"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle
                      className="w-5 h-5 text-copper shrink-0 mt-0.5"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <h3 className="font-bold text-accent">
                      {t(`care.durability.${point.titleKey}`)}
                    </h3>
                  </div>
                  <p className="text-body-sm text-content-secondary leading-relaxed">
                    {t(`care.durability.${point.descriptionKey}`)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
