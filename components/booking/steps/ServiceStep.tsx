"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Info, Plus, Search, Sparkles, X } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import type { PublicServiceTree } from "@/lib/services/types";
import { cn } from "@/lib/utils";
import { Switch } from "../Switch";
import type { CartItem } from "../types";

type ServiceStepProps = {
  tree: PublicServiceTree;
  currency: string;
  cart: CartItem[];
  onToggle: (item: CartItem) => void;
  onRemove: (serviceId: string) => void;
};

function buildItem(service: CartItem["service"]): CartItem {
  return { service: { ...service }, quantity: 1, slot: null };
}

/**
 * Step 1 — services (Template Step1 parity): grouped switch-cards with live
 * search and a selected-services banner.
 */
export default function ServiceStep({ tree, currency, cart, onToggle, onRemove }: ServiceStepProps) {
  const t = useTranslations("booking");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const searching = needle.length > 0;

  const inCart = (id: string) => cart.some((line) => line.service.id === id);
  const toggle = (s: CartItem["service"]) => onToggle(buildItem(s));

  // Flatten groups → categories → filtered services into sections.
  const sections = useMemo(() => {
    const out: {
      groupSlug: string;
      groupTitle: string;
      category: { slug: string; title: string };
      services: CartItem["service"][];
    }[] = [];
    for (const group of tree.groups) {
      for (const category of group.categories) {
        const services = category.services.filter(
          (s) =>
            !searching ||
            s.title.toLowerCase().includes(needle) ||
            (s.shortDesc ?? "").toLowerCase().includes(needle),
        );
        if (services.length === 0) continue;
        out.push({
          groupSlug: group.slug,
          groupTitle: group.title,
          category: { slug: category.slug, title: category.title },
          services: services.map((s) => ({
            ...s,
            groupSlug: group.slug,
            groupTitle: group.title,
            categorySlug: category.slug,
            categoryTitle: category.title,
          })),
        });
      }
    }
    return out;
  }, [tree, searching, needle]);

  const serviceCount = tree.groups.reduce(
    (sum, g) => sum + g.categories.reduce((a, c) => a + c.services.length, 0),
    0,
  );

  return (
    <div className="w-full max-w-5xl space-y-4">
      {/* Header & search */}
      <div className="space-y-4 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-content-primary">
              {t("services.title")}
            </h2>
            <p className="mt-1 text-sm text-content-secondary">{t("services.subtitle")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-interactive bg-surface-primary px-3 py-1.5 text-xs font-bold">
              <Sparkles className="size-3.5 text-copper" aria-hidden="true" />
              <span>{t("services.count", { n: serviceCount })}</span>
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3.5 text-content-tertiary">
            <Search className="size-4" aria-hidden="true" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("services.searchPlaceholder")}
            aria-label={t("services.searchPlaceholder")}
            className="h-12 w-full rounded-control border border-border-interactive bg-surface-primary ps-10 pe-10 text-sm shadow-elevation-1 outline-none transition-colors placeholder:text-content-tertiary hover:border-copper focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("services.clearSearch")}
              className="absolute inset-y-0 inset-e-0 flex cursor-pointer items-center pe-3 text-content-tertiary hover:text-content-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Selected banner */}
      {cart.length > 0 ? (
        <div className="flex flex-col justify-between gap-3 rounded-panel border-2 border-copper bg-surface-secondary p-3.5 shadow-elevation-1 sm:flex-row sm:items-center sm:p-4">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-content-contrast">
            {t("services.selectedCount", { n: cart.length })}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {cart.map((line) => (
              <span
                key={line.service.id}
                className="inline-flex items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-2.5 py-1 text-xs font-bold text-content-primary"
              >
                <span className="max-w-[140px] truncate text-content-primary sm:max-w-[200px]">
                  {line.service.title}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(line.service.id)}
                  title={t("services.removeService")}
                  className="cursor-pointer rounded p-0.5 text-content-tertiary hover:text-red-600"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Services grouped */}
      {sections.length === 0 ? (
        <div className="rounded-panel border border-border-primary bg-surface-secondary p-8 text-center">
          <Info className="mx-auto mb-2 size-8 text-copper opacity-60" aria-hidden="true" />
          <h3 className="text-base font-bold text-content-primary">{t("services.noResultsTitle")}</h3>
          <p className="mt-1 text-xs text-content-secondary">{t("services.noResultsDesc")}</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 cursor-pointer rounded-control bg-accent px-4 py-2 text-xs font-bold text-content-contrast transition-colors hover:bg-accent-hover"
          >
            {t("services.clearSearch")}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section, index) => {
            const isNewGroup = index === 0 || sections[index - 1]?.groupSlug !== section.groupSlug;
            return (
              <section key={`${section.groupSlug}-${section.category.slug}`} className="space-y-3">
                {isNewGroup ? (
                  <h2 className="flex items-center gap-2 pt-1 text-lg font-black leading-snug tracking-tight text-content-primary sm:text-xl">
                    <span
                      aria-hidden="true"
                      className="inline-block h-6 w-1.5 shrink-0 rounded-full bg-linear-to-b from-copper to-accent"
                    />
                    {section.groupTitle}
                  </h2>
                ) : null}

                <div className="flex items-center justify-between gap-2 border-b-2 border-border-primary pb-1.5">
                  <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-copper-deep sm:text-base">
                    <span aria-hidden="true" className="inline-block h-4 w-1 rounded-full bg-copper" />
                    <span>{section.category.title}</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-content-tertiary">
                    {t("services.options", { n: section.services.length })}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {section.services.map((service) => {
                    const selected = inCart(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggle(service)}
                        className={cn(
                          "relative mx-auto flex w-full max-w-md cursor-pointer select-none flex-col justify-between rounded-panel border p-3.5 transition-all duration-200 sm:p-4",
                          selected
                            ? "border-copper bg-surface-secondary shadow-md ring-2 ring-copper"
                            : "border-border-primary bg-surface-secondary shadow-elevation-1 hover:border-copper hover:bg-surface-secondary",
                        )}
                      >
                      {/* Top badges + switch */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {service.isFeatured ? (
                            <span className="rounded-full border border-copper/40 bg-copper/15 px-2 py-0.5 text-[10px] font-bold text-copper-deep">
                              {t("services.featuredTag")}
                            </span>
                          ) : null}
                          {service.durationMin ? (
                            <span className="rounded-full border border-border-interactive bg-surface-primary px-2 py-0.5 text-[10px] font-bold text-content-secondary">
                              {service.durationMin}m
                            </span>
                          ) : null}
                        </div>

                        <div
                          className="flex shrink-0 items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span
                            className={cn(
                              "hidden text-[11px] font-extrabold transition-colors xs:inline",
                              selected ? "text-copper-deep" : "text-content-secondary",
                            )}
                          >
                            {selected ? t("services.selectedLabel") : t("services.selectLabel")}
                          </span>
                          <Switch
                            checked={selected}
                            onCheckedChange={() => toggle(service)}
                            aria-label={service.title}
                          />
                        </div>
                      </div>

                      {/* Title + desc */}
                      <div className="my-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black leading-snug tracking-tight text-content-primary sm:text-base">
                            {service.title}
                          </h4>
                          {selected ? (
                            <CheckCircle2 className="size-4 shrink-0 text-copper" aria-hidden="true" />
                          ) : null}
                        </div>
                        {service.shortDesc ? (
                          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-content-secondary">
                            {service.shortDesc}
                          </p>
                        ) : null}
                      </div>

                      {/* Price + status */}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-primary/80 pt-2.5">
                        <div>
                          <div className="text-[10px] font-medium text-content-tertiary">
                            {t("services.priceLabel")}
                          </div>
                          <div className="text-sm font-black text-accent sm:text-base">
                            {service.price != null ? `${formatNumber(service.price)} ${currency}` : ""}
                          </div>
                        </div>

                        {selected ? (
                          <span className="inline-flex items-center gap-1.5 rounded-control bg-copper px-3 py-1 text-xs font-bold text-content-contrast shadow-elevation-1">
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            {t("services.selectedBadge")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-control border border-border-interactive bg-surface-primary px-2.5 py-1 text-xs font-bold text-copper-deep transition-colors hover:bg-surface-tertiary">
                            <Plus className="size-3.5 text-copper" aria-hidden="true" />
                            {t("services.add")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
              );
            })}
        </div>
      )}

      {/* Spacer to prevent the mobile bottom bar overlapping */}
      <div aria-hidden="true" className="h-14 sm:h-20 lg:hidden" />
    </div>
  );
}
