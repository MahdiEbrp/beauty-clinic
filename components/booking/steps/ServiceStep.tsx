"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Clock, Plus, Repeat } from "lucide-react";
import PriceTag from "@/components/pricing/PriceTag";
import type { PublicServiceTree } from "@/lib/services/types";
import { cn } from "@/lib/utils";
import type { SelectedService } from "../types";

type ServiceStepProps = {
  tree: PublicServiceTree;
  currency: string;
  selectedId: string | null;
  initialGroupSlug?: string;
  onSelect: (service: SelectedService) => void;
};

/**
 * Step 1 — pick a service. Group chips up top filter the category/service
 * list; each row shows localized title, price and duration.
 */
export default function ServiceStep({
  tree,
  currency,
  selectedId,
  initialGroupSlug,
  onSelect,
}: ServiceStepProps) {
  const t = useTranslations("booking");
  const [activeGroup, setActiveGroup] = useState(
    initialGroupSlug ?? tree.groups[0]?.slug ?? "",
  );

  const group = tree.groups.find((g) => g.slug === activeGroup) ?? tree.groups[0];

  return (
    <div>
      <div className="scrollbar-hide -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {tree.groups.map((g) => (
          <button
            key={g.slug}
            type="button"
            onClick={() => setActiveGroup(g.slug)}
            aria-pressed={g.slug === group?.slug}
            className={cn(
              "min-h-11 shrink-0 rounded-pill border px-5 text-body-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              g.slug === group?.slug
                ? "border-accent bg-accent text-content-contrast shadow-elevation-2"
                : "border-border-interactive bg-surface-secondary text-content-secondary hover:bg-surface-tertiary",
            )}
          >
            {g.title}
          </button>
        ))}
      </div>

      <ul role="list" className="space-y-4">
        {group?.categories.map((category) => (
          <li key={category.slug}>
            <p className="mb-2 flex items-center gap-2 text-caption font-bold uppercase tracking-wide text-copper-strong">
              <span aria-hidden="true" className="h-px w-6 bg-copper/40" />
              {category.title}
            </p>
            <div className="space-y-2">
              {category.services.map((service) => {
                const active = service.id === selectedId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      onSelect({
                        ...service,
                        groupSlug: group?.slug ?? "",
                        groupTitle: group?.title ?? category.title,
                        categorySlug: category.slug,
                        categoryTitle: category.title,
                      })
                    }
                    aria-pressed={active}
                    className={cn(
                      "group flex w-full items-center justify-between gap-4 rounded-panel border p-4 text-start transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:p-5",
                      active
                        ? "border-copper-deep bg-surface-tertiary shadow-elevation-2"
                        : "border-border-primary bg-surface-secondary hover:border-border-interactive",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-body-lg font-bold text-accent">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            active
                              ? "border-copper-deep bg-copper-deep text-content-contrast"
                              : "border-border-interactive bg-surface-primary",
                          )}
                        >
                          {active ? (
                            <Check className="size-3.5" strokeWidth={3} />
                          ) : (
                            <Plus className="size-3.5 text-content-tertiary" />
                          )}
                        </span>
                        <span className="truncate">{service.title}</span>
                      </p>
                      {service.shortDesc ? (
                        <p className="mt-1 truncate text-body-sm text-content-tertiary">
                          {service.shortDesc}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-4 text-caption text-content-secondary">
                        {service.durationMin ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {service.durationMin} {t("appointment.minutes")}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5">
                          <Repeat className="size-3.5" aria-hidden="true" />
                          {service.sessionsCount}
                        </span>
                      </div>
                    </div>
                    <PriceTag
                      price={service.price}
                      priceType={service.priceType}
                      currency={currency}
                      className="shrink-0 text-body-lg font-extrabold text-copper-deep"
                      labelClassName="text-caption"
                    />
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
