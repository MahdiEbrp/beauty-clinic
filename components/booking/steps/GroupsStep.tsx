"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, X } from "lucide-react";
import type { PublicServiceTree } from "@/lib/services/types";
import { getGroupTheme } from "../group-theme";
import { type SelectedGroup, type CartItem, type HealthFlags } from "../types";
import { HealthNotice } from "./HealthNotice";
import { GroupRow } from "./GroupRow";

type GroupsStepProps = {
  tree: PublicServiceTree;
  cart: CartItem[];
  health: HealthFlags;
  phone: string;
  onHealthChange: (kind: keyof HealthFlags, value: boolean) => void;
  onToggle: (group: SelectedGroup) => void;
};

/**
 * Step 1 — treatment groups. Customers choose one or more groups (face filler,
 * body filler, …) — never an individual service, and no price is shown
 * anywhere. Renders a filterable checklist with themed rows.
 */
export default function GroupsStep({
  tree,
  cart,
  health,
  phone,
  onHealthChange,
  onToggle,
}: GroupsStepProps) {
  const t = useTranslations("booking");
  const [query, setQuery] = useState("");

  const groups = useMemo<SelectedGroup[]>(
    () => tree.groups.map((group, groupIndex) => ({ ...group, groupIndex })),
    [tree],
  );

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return groups;
    return groups.filter((group) => group.title.toLowerCase().includes(needle));
  }, [groups, needle]);

  const inCart = (id: string) => cart.some((line) => line.group.id === id);

  const resetFilters = () => setQuery("");

  return (
    <div id="groups-table-root" className="w-full space-y-3 sm:space-y-4">
      {/* Health gate */}
      <HealthNotice
        pregnant={health.pregnant}
        illness={health.illness}
        phone={phone}
        onChange={onHealthChange}
      />

      {/* Top filter & search bar */}
      <div className="rounded-panel border border-border-primary/80 bg-surface-secondary/70 p-3 shadow-xs sm:p-3.5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-body-lg font-black tracking-tight text-accent">
              {t("groups.title")}
            </h2>
            {cart.length > 0 ? (
              <span className="rounded-pill bg-accent px-2 py-0.5 text-caption font-black text-content-contrast animate-fade-in">
                {t("groups.selectedCount", { n: cart.length })}
              </span>
            ) : null}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("groups.searchPlaceholder")}
              aria-label={t("groups.searchPlaceholder")}
              className="h-11 w-full rounded-pill border border-form-input-border bg-surface-primary px-3.5 pe-9 text-body-sm text-content-primary outline-none transition-colors placeholder:text-content-tertiary hover:border-copper focus:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("groups.clearSearch")}
                className="absolute inset-y-0 inset-e-2 my-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-content-tertiary hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-10 text-center">
          <AlertCircle className="mx-auto mb-3 size-9 text-copper" aria-hidden="true" />
          <p className="text-body font-bold text-content-primary">{t("groups.noResultsTitle")}</p>
          <p className="mx-auto mt-1 max-w-sm text-caption text-content-secondary">
            {t("groups.noResultsDesc")}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mx-auto mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-accent px-5 text-body-sm font-black text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("groups.showAll", { n: groups.length })}
          </button>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-xs">
          {/* Rows */}
          <div className="divide-y divide-border-primary/60">
            {filtered.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                selected={inCart(group.id)}
                theme={getGroupTheme(group.groupIndex)}
                onToggle={() => onToggle(group)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Spacer so the sticky bottom bar never overlaps the last row */}
      <div aria-hidden="true" className="h-16 sm:h-20" />
    </div>
  );
}
