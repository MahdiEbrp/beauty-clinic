"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import type { PublicServiceTree } from "@/lib/services/types";
import type { ClinicData } from "@/data/clinic";
import BookingModal from "@/components/BookingModal";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import CategoryCard from "./CategoryCard";
import FilterToolbar from "./FilterToolbar";
import HeroSlider from "./HeroSlider";
import MobileBottomNav from "./MobileBottomNav";
import MobileDrawer from "./MobileDrawer";
import {
  buildCategoryCards,
  defaultFilters,
  filterCards,
  priceBounds,
  type CatalogFilters,
} from "./data";

type PricingContentProps = {
  tree: PublicServiceTree;
  currency: string;
  clinic?: ClinicData;
};

function EmptyState() {
  const t = useTranslations();
  return (
    <div className="rounded-panel border border-dashed border-border-interactive bg-surface-secondary px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-pill bg-surface-tertiary text-copper">
        <SearchX className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-heading-3 font-bold text-accent">
        {t("pricing.empty.title")}
      </h3>
      <p className="text-body text-content-secondary">{t("pricing.empty.description")}</p>
    </div>
  );
}

/** Services & pricing — hero slider, filters, and the category-card grid. */
export default function PricingContent({ tree, currency, clinic }: PricingContentProps) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(() => buildCategoryCards(tree), [tree]);
  const bounds = useMemo(() => priceBounds(cards), [cards]);
  const filtered = useMemo(() => filterCards(cards, filters, search), [cards, filters, search]);

  const activeCount =
    (filters.groupSlug ? 1 : 0) + (filters.priceBucket ? 1 : 0);

  const updateFilters = (next: Partial<CatalogFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const exploreGroup = (slug: string) => {
    updateFilters({ groupSlug: slug });
    scrollToGrid();
  };

  return (
    <div className="bg-surface-primary">
      <HeroSlider groups={tree.groups} onExplore={exploreGroup} />

      <div ref={gridRef} className="mx-auto max-w-content px-4 py-10 md:px-6 md:py-14">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-prose text-center md:text-start">
            <h1 className="mb-3 text-heading-2 font-bold text-accent">
              {t("pricing.sections.heading")}
            </h1>
            <p className="text-body text-content-secondary">
              {t("pricing.sections.subheading")}
            </p>
          </div>
          <p
            role="status"
            className="shrink-0 rounded-panel border border-border-primary bg-surface-secondary px-6 py-4 text-center text-heading-3 font-extrabold text-copper-strong md:self-center"
          >
            {t("pricing.filters.results", { count: filtered.length })}
          </p>
        </div>

        <div className="mb-10">
          <FilterToolbar
            search={search}
            onSearchChange={setSearch}
            sort={filters.sort}
            onSortChange={(sort) => updateFilters({ sort })}
            groups={tree.groups}
            activeGroupSlug={filters.groupSlug}
            onGroupSelect={(groupSlug) => updateFilters({ groupSlug })}
            bounds={bounds}
            priceBucket={filters.priceBucket}
            onPriceBucketSelect={(priceBucket) => updateFilters({ priceBucket })}
            activeCount={activeCount}
            onClear={() => setFilters(defaultFilters)}
            onOpenFilters={() => setDrawerOpen(true)}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filtered.map((card) => (
              <CategoryCard
                key={card.slug}
                card={card}
                currency={currency}
                onBook={() => setBookingOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <div aria-hidden="true" className="h-24 lg:hidden" />

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        groups={tree.groups}
        bounds={bounds}
        onChange={updateFilters}
        onClear={() => setFilters(defaultFilters)}
      />
      <MobileBottomNav onOpenFilters={() => setDrawerOpen(true)} />

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} clinic={clinic} currency={currency} />
      <FloatingBookingButton onOpenBooking={() => setBookingOpen(true)} />
    </div>
  );
}
