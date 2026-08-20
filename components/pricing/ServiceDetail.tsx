"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, CalendarPlus } from "lucide-react";
import type { PublicServiceRow } from "@/lib/services/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BeforeAfterSlider from "./BeforeAfterSlider";
import PriceTag from "./PriceTag";
import ServiceImage from "./ServiceImage";
import ServiceMeta from "./ServiceMeta";

type ServiceDetailProps = {
  service: PublicServiceRow;
  onBack: () => void;
  onBook: () => void;
  currency: string;
};

/** Expanded state B — full detail for one treatment. */
export default function ServiceDetail({
  service,
  onBack,
  onBook,
  currency,
}: ServiceDetailProps) {
  const t = useTranslations();

  const before = service.images.find((image) => image.type === "before");
  const after = service.images.find((image) => image.type === "after");
  const gallery = service.images.filter((image) => image.type === "gallery");

  return (
    <section className="mt-6 overflow-hidden rounded-panel border border-accent bg-surface-secondary shadow-elevation-3">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-primary p-6 md:p-8">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-body-sm font-semibold text-copper-strong transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
            {t("pricing.detail.backToCatalog")}
          </button>
          <h2 className="text-heading-2 font-bold text-accent">{service.title}</h2>
          <p className="mt-1 text-caption font-medium text-content-tertiary">
            {service.categoryTitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
<PriceTag
              price={service.price}
              priceType={service.priceType}
              currency={currency}
              className="text-heading-3 font-extrabold text-copper-deep"
            />
          <ServiceMeta
            durationMin={service.durationMin}
            sessionsCount={service.sessionsCount}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-10 p-6 md:p-8">
          {service.fullDesc ?? service.shortDesc ? (
            <section>
              <h3 className="mb-3 text-heading-3 font-bold text-accent">
                {t("pricing.detail.overview")}
              </h3>
              <p className="text-body leading-relaxed text-content-secondary">
                {service.fullDesc ?? service.shortDesc}
              </p>
            </section>
          ) : null}

          {before && after ? (
            <section>
              <h3 className="mb-3 text-heading-3 font-bold text-accent">
                {t("pricing.detail.beforeAfter")}
              </h3>
              <BeforeAfterSlider
                before={before.imageUrl}
                after={after.imageUrl}
                title={service.title}
              />
            </section>
          ) : null}

          {gallery.length > 0 ? (
            <section>
              <h3 className="mb-3 text-heading-3 font-bold text-accent">
                {t("serviceDetail.labels.gallery")}
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map((image) => (
                  <div
                    key={`${image.imageUrl}-${image.displayOrder}`}
                    className="relative aspect-4/3 overflow-hidden rounded-control"
                  >
                    <ServiceImage
                      src={image.imageUrl}
                      alt={`${service.title} — ${t("serviceDetail.labels.gallery")}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {service.faqs.length > 0 ? (
            <section>
              <h3 className="mb-3 text-heading-3 font-bold text-accent">
                {t("serviceDetail.labels.faq")}
              </h3>
              <Accordion type="single" collapsible>
                {service.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-body font-semibold text-content-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-body-sm leading-relaxed text-content-secondary">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ) : null}
        </div>

        <aside className="border-t border-border-primary p-6 md:p-8 lg:border-s lg:border-t-0">
          <div className="space-y-4 lg:sticky lg:top-24">
            <button
              type="button"
              onClick={onBook}
              className="btn-hero-primary inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-pill border border-copper bg-accent px-6 text-body-lg font-bold text-content-contrast transition-all hover:bg-accent-hover hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <CalendarPlus className="size-5" aria-hidden="true" />
              {t("serviceDetail.labels.bookNow")}
            </button>
            <p className="text-caption text-content-tertiary">
              {t("pricing.detail.bookNote")}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}