"use client";

import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type CategoryFaqItem = {
  question: string;
  answer: string;
};

type CategoryFaqProps = {
  faqs: CategoryFaqItem[];
};

/**
 * Aggregated FAQ accordion for the category page: collects every distinct
 * FAQ across the category's services (de-duplicated by question text).
 */
export default function CategoryFaq({ faqs }: CategoryFaqProps) {
  const t = useTranslations();

  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="category-faq-heading" className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <HelpCircle className="size-5 text-copper" strokeWidth={2} />
        <h2
          id="category-faq-heading"
          className="text-xl font-bold tracking-tight text-accent"
        >
          {t("categoryPage.faq.heading")}
        </h2>
      </div>
      <Accordion
        type="single"
        collapsible
        className="rounded-card border border-border-primary bg-surface-secondary/90 px-5 sm:px-6 shadow-elevation-1"
      >
        {faqs.map((faq, index) => (
          <AccordionItem key={`${faq.question}-${index}`} value={`faq-${index}`}>
            <AccordionTrigger className="py-4 text-start text-sm font-semibold text-accent">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-content-secondary">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}