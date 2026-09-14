"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, X } from "lucide-react";
import type { PublicServiceTree } from "@/lib/services/types";
import { getGroupTheme } from "../group-theme";
import type { SelectedGroup, CartItem, HealthFlags } from "../types";
import { HealthNotice } from "./HealthNotice";
import { GroupRow } from "./GroupRow";
import { GroupDetailModal } from "./GroupDetailModal";
import { GroupsPagination } from "./GroupsPagination";

type GroupsStepProps = {
  tree: PublicServiceTree;
  cart: CartItem[];
  health: HealthFlags;
  phone: string;
  onHealthChange: (kind: keyof HealthFlags, value: boolean) => void;
  onToggle: (group: SelectedGroup) => void;
  onRemove: (groupId: string) => void;
};

const PAGE_SIZES = [6, 8, 12, 16] as const;

/**
 * Step 1 — treatment groups. Customers choose a group (face filler, body
 * filler, …) — never an individual service, and no price is shown anywhere.
 * Renders a filterable, paginated table with themed rows and a detail modal.
 */
export default function GroupsStep({
  tree,
  cart,
  health,
  phone,
  onHealthChange,
  onToggle,
  onRemove,
}: GroupsStepProps) {
  const t = useTranslations("booking");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [activeDetail, setActiveDetail] = useState<SelectedGroup | null>(null);

  const groups = useMemo<SelectedGroup[]>(
    () => tree.groups.map((group, groupIndex) => ({ ...group, groupIndex })),
    [tree],
  );

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return groups;
    return groups.filter(
      (group) =>
        group.title.toLowerCase().includes(needle) ||
        (group.description ?? "").toLowerCase().includes(needle),
    );
  }, [groups, needle]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const paginated = filtered.slice(start, end);

  const inCart = (id: string) => cart.some((line) => line.group.id === id);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      const startPage = Math.max(2, safePage - 1);
      const endPage = Math.min(totalPages - 1, safePage + 1);
      for (let i = startPage; i <= endPage; i += 1) pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const goTo = (next: number) => {
    const target = Math.min(Math.max(1, next), totalPages);
    setPage(target);
    document
      .getElementById("groups-table-root")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setQuery("");
    setPage(1);
  };

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
            <span className="rounded-pill border border-copper/30 bg-copper/10 px-2 py-0.5 text-caption font-black text-copper-deep">
              {t("groups.count", { n: groups.length })}
            </span>
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
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
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

      {/* Selected banner */}
      {cart.length > 0 ? (
        <div className="flex flex-col justify-between gap-3 rounded-panel border-2 border-copper bg-surface-secondary p-3.5 shadow-elevation-1 sm:flex-row sm:items-center sm:p-4">
          <span className="rounded-full bg-accent px-3 py-1 text-caption font-black text-content-contrast">
            {t("groups.selectedCount", { n: cart.length })}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {cart.map((line) => (
              <span
                key={line.group.id}
                className="inline-flex items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-2.5 py-1 text-caption font-bold text-content-primary"
              >
                <span className="max-w-36 truncate sm:max-w-52">{line.group.title}</span>
                <button
                  type="button"
                  onClick={() => onRemove(line.group.id)}
                  aria-label={t("groups.removeGroup")}
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
            {t("groups.showingRange", { from: start + 1, to: end, total: filtered.length })}
          </span>
        </div>
      ) : null}

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
          {/* Desktop header */}
          <div
            role="row"
            className="hidden grid-cols-[3rem_minmax(0,1fr)_8rem_7rem_9rem] items-center gap-3 border-b border-border-primary bg-surface-tertiary/90 px-4 py-3 text-caption font-black text-content-secondary select-none md:grid"
          >
            <div className="text-center">{t("groups.colIndex")}</div>
            <div>{t("groups.colGroup")}</div>
            <div className="text-center">{t("groups.colCategories")}</div>
            <div className="text-center">{t("groups.colServices")}</div>
            <div className="text-center">{t("groups.colAction")}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border-primary/60">
            {paginated.map((group, index) => (
              <GroupRow
                key={group.id}
                group={group}
                rowNumber={start + index + 1}
                selected={inCart(group.id)}
                theme={getGroupTheme(group.groupIndex)}
                onToggle={() => onToggle(group)}
                onInfo={() => setActiveDetail(group)}
              />
            ))}
          </div>

          {/* Footer: pagination + page size */}
          <GroupsPagination
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
        <GroupDetailModal
          group={activeDetail}
          theme={getGroupTheme(activeDetail.groupIndex)}
          selected={inCart(activeDetail.id)}
          onToggle={() => onToggle(activeDetail)}
          onClose={() => setActiveDetail(null)}
        />
      ) : null}

      {/* Spacer so the sticky bottom bar never overlaps the last row */}
      <div aria-hidden="true" className="h-16 sm:h-20" />
    </div>
  );
}
