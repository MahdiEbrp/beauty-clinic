"use client";

import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal } from "lucide-react";

type MobileBottomNavProps = {
  onOpenFilters: () => void;
};

/** Fixed bottom navigation (mobile): focus search / open the filter drawer. */
export default function MobileBottomNav({ onOpenFilters }: MobileBottomNavProps) {
  const t = useTranslations();

  const focusSearch = () => {
    const input = document.getElementById("pricing-search");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus();
  };

  return (
    <nav
      aria-label={t("pricing.filters.label")}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-10 border-t border-border-primary bg-surface-secondary/90 px-6 py-3 shadow-[0_-4px_20px_rgba(57,9,10,0.08)] backdrop-blur-md lg:hidden"
    >
      <button
        type="button"
        onClick={focusSearch}
        className="inline-flex min-h-11 flex-col items-center gap-1 text-content-tertiary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Search className="size-5" aria-hidden="true" />
        <span className="text-caption">{t("pricing.hero.searchLabel")}</span>
      </button>
      <button
        type="button"
        onClick={onOpenFilters}
        className="inline-flex min-h-11 flex-col items-center gap-1 text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <SlidersHorizontal className="size-5" aria-hidden="true" />
        <span className="text-caption">{t("pricing.filters.label")}</span>
      </button>
    </nav>
  );
}
