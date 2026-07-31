"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Wine,
  Pill,
  Dumbbell,
  Palette,
  ClipboardCheck,
  Droplets,
  Thermometer,
  Ban,
  Cigarette,
  Apple,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CareInstruction } from "@/data/care";

const iconMap: Record<string, LucideIcon> = {
  wine: Wine,
  pill: Pill,
  dumbbell: Dumbbell,
  palette: Palette,
  clipboardCheck: ClipboardCheck,
  droplets: Droplets,
  thermometer: Thermometer,
  ban: Ban,
  cigarette: Cigarette,
  orange: Apple,
  phone: Phone,
};

interface CareAccordionProps {
  items: readonly CareInstruction[];
  namespace: string;
}

export default function CareAccordion({ items, namespace }: CareAccordionProps) {
  const t = useTranslations();

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => {
        const Icon = iconMap[item.iconKey] ?? Droplets;

        return (
          <AccordionItem
            key={item.titleKey}
            value={item.titleKey}
            className="border-b border-border-primary"
          >
            <AccordionTrigger className="min-h-11 py-4 text-start hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="w-10 h-10 bg-surface-tertiary text-copper rounded-control flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="font-bold text-accent">
                  {t(`${namespace}.${item.titleKey}`)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="ps-13">
              <p className="text-content-secondary leading-relaxed">
                {t(`${namespace}.${item.descriptionKey}`)}
              </p>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
