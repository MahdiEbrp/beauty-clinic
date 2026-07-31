"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import PricingTable from "./PricingTable";
import { pricingCategories } from "@/data/pricing";

export default function PricingAccordion() {
  const t = useTranslations();

  return (
    <Accordion type="single" collapsible className="w-full">
      {pricingCategories.map((category) => (
        <AccordionItem
          key={category.key}
          value={category.key}
          className="bg-surface-secondary border border-border-primary rounded-panel px-6 mb-4 overflow-hidden"
        >
          <AccordionTrigger className="min-h-14 py-4 text-start hover:no-underline">
            <span className="flex items-center gap-3">
              <span className="font-bold text-accent text-[clamp(1rem,3vw,1.25rem)]">
                {t(`pricing.tabs.${category.key}`)}
              </span>
              <span className="text-xs text-content-tertiary">
                ({category.items.length})
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="mb-4">
              <p className="text-sm text-content-secondary">
                {t(`pricing.categories.${category.key}_desc`)}
              </p>
              {category.noteKey && (
                <Badge variant="outline" className="mt-3 text-warning border-warning">
                  {t(`pricing.categories.${category.noteKey}`)}
                </Badge>
              )}
            </div>
            <PricingTable
              items={category.items}
              namespace="pricing.brands"
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
