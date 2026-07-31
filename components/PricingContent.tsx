"use client";

import { useTranslations } from "next-intl";
import PricingAccordion from "@/components/PricingAccordion";

export default function PricingContent() {
  const t = useTranslations();

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] mb-4 text-accent">
            {t("pricing.heading")}
          </h1>
          <p className="text-content-secondary">
            {t("pricing.description")}
          </p>
        </div>

        <PricingAccordion />

        <div className="mt-8 text-sm text-content-tertiary">
          <p>{t("common.priceNote")}</p>
          <p className="mt-2">{t("pricing.disclaimer")}</p>
        </div>
      </div>
    </section>
  );
}
