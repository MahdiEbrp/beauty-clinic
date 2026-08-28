"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type PricingSearchEntry = {
  groupSlug: string;
  text: string;
};

type PricingSearchProps = {
  groups: { slug: string }[];
  entries: PricingSearchEntry[];
  placeholder?: string;
  label?: string;
  clearLabel?: string;
};

/**
 * Client-only search enhancement over the server-rendered article. It searches
 * the DB-backed dataset (service title/short desc/category/group) and collapses
 * non-matching sections by toggling their `display`. The full content is always
 * present in the initial HTML — this only narrows the view while typing.
 */
export default function PricingSearch({
  groups,
  entries,
  placeholder = "Search services, fillers, or laser services...",
  label = "Search pricing",
  clearLabel = "Clear search",
}: PricingSearchProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = query.trim().toLowerCase();
    for (const group of groups) {
      const el = document.getElementById(`pricing-${group.slug}`);
      if (!el) continue;
      if (!q) {
        el.style.display = "";
        continue;
      }
      const hit = entries.some(
        (entry) => entry.groupSlug === group.slug && entry.text.toLowerCase().includes(q)
      );
      el.style.display = hit ? "" : "none";
    }
    return () => {
      for (const group of groups) {
        const el = document.getElementById(`pricing-${group.slug}`);
        if (el) el.style.display = "";
      }
    };
  }, [query, groups, entries]);

  return (
    <div className="w-full">
      <div className="relative w-full max-w-xl">
        <Search
          className="pointer-events-none absolute top-1/2 inset-s-4 -translate-y-1/2 size-4 text-content-tertiary"
          aria-hidden="true"
        />
        <label htmlFor="pricing-search-input" className="sr-only">
          {label}
        </label>
        <input
          id="pricing-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="min-h-11 w-full rounded-pill border border-border-interactive bg-surface-secondary ps-11 pe-11 text-dash-body-sm text-content-primary placeholder:text-content-tertiary focus:border-copper focus:ring-2 focus:ring-copper/20 outline-none transition-all shadow-sm"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={clearLabel}
            className="absolute top-1/2 inset-e-3 flex size-8 items-center justify-center -translate-y-1/2 rounded-full text-content-tertiary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
export { PricingSearch };
