"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import type { PricingFaq as PricingFaqType } from "@/lib/services/pricing-page";

type PricingFaqProps = {
  faqs: PricingFaqType[];
  heading?: string;
};

/** FAQ accordion rendering database FAQ records. */
export default function PricingFaq({
  faqs,
  heading = "Frequently Asked Questions",
}: PricingFaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="size-5 text-copper" />
        <h2 className="text-2xl font-bold text-accent tracking-tight">
          {heading}
        </h2>
      </div>
      <Accordion
        type="single"
        collapsible
        className="rounded-card border border-border-primary bg-surface-secondary/90 px-5 sm:px-6 shadow-elevation-1"
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={`${faq.question}-${index}`}
            value={`faq-${index}`}
          >
            <AccordionTrigger className="text-dash-body font-semibold text-accent py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-dash-body-sm text-content-secondary leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
export { PricingFaq };
