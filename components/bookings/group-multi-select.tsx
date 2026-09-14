"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { LayoutList, Search, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type GroupOption = { id: string; title: string };

/**
 * Searchable multi-select for linking service groups to a slot (one slot →
 * many groups). An empty selection intentionally means "available for every
 * group" — the hint below the field makes that explicit.
 */
export function GroupMultiSelect({
  options,
  selected,
  onChange,
  loading,
}: {
  options: GroupOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  loading?: boolean;
}) {
  const t = useTranslations("slotWizard");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.title.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  };

  const selectedTitles = selected
    .map((id) => options.find((option) => option.id === id)?.title)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-2">
      <div className="flex h-11 items-center gap-2 rounded-control border border-form-input-border bg-form-input-bg px-3 transition-colors focus-within:border-copper">
        <Search className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("fields.groups.searchPlaceholder")}
          className="h-full w-full bg-transparent text-dash-body-sm text-accent outline-none placeholder:text-content-tertiary"
        />
      </div>

      {selectedTitles.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTitles.map((title, index) => (
            <button
              key={selected[index]}
              type="button"
              onClick={() => toggle(selected[index])}
              className="inline-flex min-h-8 items-center gap-1 rounded-pill border border-accent/25 bg-accent/10 px-2.5 text-dash-caption font-bold text-accent transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {title}
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div
        role="group"
        aria-label={t("fields.groups.label")}
        className="max-h-56 overflow-y-auto rounded-control border border-border-primary bg-surface-primary"
      >
        {loading ? (
          <div className="space-y-2 p-3" aria-busy="true">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-control bg-surface-tertiary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-3 text-dash-caption text-content-tertiary">
            {query.trim() ? t("fields.groups.noResults") : t("fields.groups.empty")}
          </p>
        ) : (
          <ul className="divide-y divide-border-primary">
            {filtered.map((option) => {
              const checked = selected.includes(option.id);
              return (
                <li key={option.id}>
                  <label
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 px-3 py-1.5 transition-colors hover:bg-surface-secondary",
                      checked && "bg-accent-subtle",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(option.id)}
                    />
                    <span className="min-w-0 flex-1 truncate text-dash-body-sm text-accent">
                      {option.title}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-dash-caption text-content-tertiary">
        <LayoutList className="size-3.5 shrink-0" aria-hidden="true" />
        {selected.length === 0
          ? t("fields.groups.allHint")
          : t("fields.groups.count", { count: selected.length })}
      </p>
    </div>
  );
}
