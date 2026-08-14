"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import type { PublicServiceTree } from "@/lib/services/types";
import BookingModal from "@/components/BookingModal";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import FeaturedCard from "./FeaturedCard";
import FilterBar from "./FilterBar";
import GroupRail from "./GroupRail";
import PricingHero from "./PricingHero";
import ServiceDetail from "./ServiceDetail";
import ServiceRowCard from "./ServiceRowCard";
import {
  categoryOptions,
  defaultFilters,
  filterRows,
  flattenTree,
  priceBounds,
  type CatalogFilters,
} from "./data";

function EmptyState() {
  const t = useTranslations();
  return (
    <div className="rounded-panel border border-dashed border-border-interactive bg-surface-secondary p-12 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-pill bg-surface-tertiary text-copper">
        <SearchX className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-heading-3 font-bold text-accent">
        {t("pricing.empty.title")}
      </h3>
      <p className="text-body text-content-secondary">
        {t("pricing.empty.description")}
      </p>
    </div>
  );
}

type PricingContentProps = {
  tree: PublicServiceTree;
};

/** Services & pricing experience — catalog (state A) + expanded detail (state B). */
export default function PricingContent({ tree }: PricingContentProps) {
  const [activeGroupSlug, setActiveGroupSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const rows = useMemo(() => flattenTree(tree), [tree]);
  const bounds = useMemo(() => priceBounds(rows), [rows]);
  const categories = useMemo(() => categoryOptions(tree), [tree]);

  const filtered = useMemo(
    () =>
      filterRows(rows, {
        groupSlug: activeGroupSlug,
        search: query,
        categorySlug: filters.categorySlug,
        priceBucket: filters.priceBucket,
        sort: filters.sort,
      }),
    [rows, activeGroupSlug, query, filters],
  );

  const expanded = useMemo(
    () => rows.find((row) => row.id === expandedId) ?? null,
    [rows, expandedId],
  );

  const showFeatured =
    !activeGroupSlug &&
    !filters.categorySlug &&
    !filters.priceBucket &&
    !query.trim();
  const featuredService = useMemo(
    () => (showFeatured ? rows.find((row) => row.isFeatured) ?? rows[0] ?? null : null),
    [rows, showFeatured],
  );

  const listRows = filtered;

  const activeCount =
    (filters.categorySlug ? 1 : 0) + (filters.priceBucket ? 1 : 0);

  const updateFilters = (next: Partial<CatalogFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setExpandedId(null);
  };

  const toggleRow = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  useEffect(() => {
    if (!expandedId) return;
    const element = document.getElementById(`detail-${expandedId}`);
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  }, [expandedId]);

  return (
    <div className="bg-surface-primary">
      <PricingHero query={query} onQueryChange={setQuery} />

      <div className="mx-auto max-w-content space-y-8 px-6 py-12">
        <GroupRail
          groups={tree.groups}
          activeSlug={activeGroupSlug}
          onSelect={(slug) => {
            setActiveGroupSlug(slug);
            setExpandedId(null);
          }}
        />

        <FilterBar
          filters={filters}
          onChange={updateFilters}
          onClear={() => updateFilters(defaultFilters)}
          categories={categories}
          bounds={bounds}
          activeCount={activeCount}
          resultCount={filtered.length}
        />

        {featuredService ? (
          <FeaturedCard
            service={featuredService}
            onExpand={() => toggleRow(featuredService.id)}
            onBook={() => setBookingOpen(true)}
          />
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-4">
            {listRows.map((row) => (
              <li key={row.id}>
                <ServiceRowCard
                  service={row}
                  expanded={row.id === expandedId}
                  detailId={`detail-${row.id}`}
                  onToggle={() => toggleRow(row.id)}
                />
                {expanded && row.id === expandedId ? (
                  <ServiceDetail
                    service={expanded}
                    onBack={() => setExpandedId(null)}
                    onBook={() => setBookingOpen(true)}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
      <FloatingBookingButton onOpenBooking={() => setBookingOpen(true)} />
    </div>
  );
}