"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicServiceTree } from "@/lib/services/types";
import { getGroupTheme } from "../group-theme";
import { Root as SelectRoot, Value as SelectValue, Trigger as SelectTrigger, Content as SelectContent, Item as SelectItem } from "../booking-select";
import type { SelectedService, CartItem, HealthFlags } from "../types";
import { HealthNotice } from "./HealthNotice";
import { ServiceRow } from "./ServiceRow";
import { ServiceDetailModal } from "./ServiceDetailModal";
import { ServicesPagination } from "./ServicesPagination";

type ServicesStepProps = {
  tree: PublicServiceTree;
  cart: CartItem[];
  health: HealthFlags;
  phone: string;
  onHealthChange: (kind: keyof HealthFlags, value: boolean) => void;
  onToggle: (service: CartItem) => void;
  onRemove: (serviceId: string) => void;
};

const PAGE_SIZES = [6, 8, 12, 16] as const;

function buildItem(service: SelectedService): CartItem {
  return { service: { ...service }, quantity: 1, slot: null };
}

/**
 * Step 1 — services (Template parity): filter + search + paginated table with
 * themed rows (group palette by index) and a comprehensive detail modal.
 */
export default function ServicesStep({ tree, cart, health, phone, onHealthChange, onToggle, onRemove }: ServicesStepProps) {
  const t = useTranslations("booking");
  const [query, setQuery] = useState("");
  const [groupSlug, setGroupSlug] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [activeDetail, setActiveDetail] = useState<SelectedService | null>(null);

  const rows = useMemo(() => {
    const out: (SelectedService & { groupIndex: number })[] = [];
    tree.groups.forEach((group, groupIndex) => {
      group.categories.forEach((category) => {
        category.services.forEach((service) => {
          out.push({
            ...service,
            groupSlug: group.slug,
            groupTitle: group.title,
            categorySlug: category.slug,
            categoryTitle: category.title,
            groupIndex,
          });
        });
      });
    });
    return out;
  }, [tree]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return rows.filter((service) => {
      const matchesGroup = groupSlug === "all" || service.groupSlug === groupSlug;
      if (!matchesGroup) return false;
      if (!needle) return true;
      return (
        service.title.toLowerCase().includes(needle) ||
        (service.shortDesc ?? "").toLowerCase().includes(needle) ||
        (service.categoryTitle ?? "").toLowerCase().includes(needle) ||
        (service.groupTitle ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, groupSlug, needle]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const paginated = filtered.slice(start, end);

  const inCart = (id: string) => cart.some((line) => line.service.id === id);
  const toggle = (service: SelectedService) => onToggle(buildItem(service));
  const remove = (id: string) => onRemove(id);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      const startPage = Math.max(2, safePage - 1);
      const endPage = Math.min(totalPages - 1, safePage + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const goTo = (next: number) => {
    const target = Math.min(Math.max(1, next), totalPages);
    setPage(target);
    document.getElementById("services-table-root")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setQuery("");
    setGroupSlug("all");
    setPage(1);
  };

  return (
    <div id="services-table-root" className="w-full space-y-3 sm:space-y-4">
      {/* Health gate */}
      <HealthNotice pregnant={health.pregnant} illness={health.illness} phone={phone} onChange={onHealthChange} />

      {/* Top filter & search bar */}
      <div className="rounded-panel border border-border-primary/80 bg-surface-secondary/70 p-3 shadow-xs sm:p-3.5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-body-lg font-black tracking-tight text-accent">{t("services.title")}</h2>
            <span className="rounded-pill border border-copper/30 bg-copper/10 px-2 py-0.5 text-caption font-black text-copper-deep">
              {t("services.count", { n: rows.length })}
            </span>
            {cart.length > 0 ? (
              <span className="rounded-pill bg-accent px-2 py-0.5 text-caption font-black text-content-contrast animate-fade-in">
                {t("services.selectedCount", { n: cart.length })}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SelectRoot value={groupSlug} onValueChange={(value) => {
              setGroupSlug(value || "all");
              setPage(1);
            }}>
              <SelectTrigger className="w-full rounded-pill sm:w-52" aria-label={t("services.groupFilter")}>
                <SelectValue placeholder={t("services.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("services.allCategories")}</SelectItem>
                {tree.groups.map((group, index) => {
                  const theme = getGroupTheme(index);
                  const count = group.categories.reduce((sum, cat) => sum + cat.services.length, 0);
                  return (
                    <SelectItem key={group.slug} value={group.slug}>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", theme.tabDotColor)} aria-hidden="true" />
                        <span className="truncate">{group.title}</span>
                        <span className="text-caption text-content-tertiary">({count})</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </SelectRoot>

            <div className="relative w-full sm:w-60">
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={t("services.searchPlaceholder")}
                aria-label={t("services.searchPlaceholder")}
                className="h-11 w-full rounded-pill border border-form-input-border bg-surface-primary px-3.5 pe-9 text-body-sm text-content-primary outline-none transition-colors placeholder:text-content-tertiary hover:border-copper focus:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("services.clearSearch")}
                  className="absolute inset-y-0 inset-e-2 my-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-content-tertiary hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Selected banner */}
      {cart.length > 0 ? (
        <div className="flex flex-col justify-between gap-3 rounded-panel border-2 border-copper bg-surface-secondary p-3.5 shadow-elevation-1 sm:flex-row sm:items-center sm:p-4">
          <span className="rounded-full bg-accent px-3 py-1 text-caption font-black text-content-contrast">
            {t("services.selectedCount", { n: cart.length })}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {cart.map((line) => (
              <span
                key={line.service.id}
                className="inline-flex items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-2.5 py-1 text-caption font-bold text-content-primary"
              >
                <span className="max-w-36 truncate sm:max-w-52">{line.service.title}</span>
                <button
                  type="button"
                  onClick={() => remove(line.service.id)}
                  aria-label={t("services.removeService")}
                  className="flex size-6 cursor-pointer items-center justify-center rounded p-0.5 text-content-tertiary hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Result stats */}
      {filtered.length > 0 ? (
        <div className="flex justify-end px-1 text-caption">
          <span className="font-bold text-content-tertiary">
            {t("services.showingRange", { from: start + 1, to: end, total: filtered.length })}
          </span>
        </div>
      ) : null}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-10 text-center">
          <AlertCircle className="mx-auto mb-3 size-9 text-copper" aria-hidden="true" />
          <p className="text-body font-bold text-content-primary">{t("services.noResultsTitle")}</p>
          <p className="mx-auto mt-1 max-w-sm text-caption text-content-secondary">{t("services.noResultsDesc")}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mx-auto mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-accent px-5 text-body-sm font-black text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("services.showAll", { n: rows.length })}
          </button>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-xs">
          {/* Desktop header */}
          <div
            role="row"
            className="hidden grid-cols-[3rem_minmax(0,1fr)_9rem_6rem_7.5rem] items-center gap-3 border-b border-border-primary bg-surface-tertiary/90 px-4 py-3 text-caption font-black text-content-secondary select-none md:grid"
          >
            <div className="text-center">{t("services.colIndex")}</div>
            <div>{t("services.colService")}</div>
            <div className="text-center">{t("services.colCategory")}</div>
            <div className="text-center">{t("services.colDuration")}</div>
            <div className="text-center">{t("services.colAction")}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border-primary/60">
            {paginated.map((service, index) => (
              <ServiceRow
                key={service.id}
                service={service}
                rowNumber={start + index + 1}
                selected={inCart(service.id)}
                theme={getGroupTheme(service.groupIndex)}
                onToggle={() => toggle(service)}
                onInfo={() => setActiveDetail(service)}
              />
            ))}
          </div>

          {/* Footer: pagination + page size */}
          <ServicesPagination
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            sizes={PAGE_SIZES}
            pageNumbers={pageNumbers}
            onGoTo={goTo}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Detail modal */}
      {activeDetail ? (
        <ServiceDetailModal
          service={activeDetail}
          theme={getGroupTheme(rows.find((r) => r.id === activeDetail.id)?.groupIndex ?? 0)}
          selected={inCart(activeDetail.id)}
          onToggle={() => toggle(activeDetail)}
          onClose={() => setActiveDetail(null)}
        />
      ) : null}

      {/* Spacer so the sticky bottom bar never overlaps the last row */}
      <div aria-hidden="true" className="h-16 sm:h-20" />
    </div>
  );
}