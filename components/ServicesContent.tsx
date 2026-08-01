"use client";

import { useTranslations } from "next-intl";
import ServiceDetailCards from "@/components/ServiceDetailCards";

export default function ServicesContent() {
  const t = useTranslations();

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h1 className="text-heading-1 mb-4 text-accent">
            {t("servicesPage.heading")}
          </h1>
          <p className="text-content-secondary">
            {t("servicesPage.description")}
          </p>
        </div>

        <ServiceDetailCards />
      </div>
    </section>
  );
}
