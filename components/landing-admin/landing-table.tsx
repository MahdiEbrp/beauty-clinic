"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ImageIcon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { rowMeta, rowTitle } from "./config";
import {
  SelectionCheckbox,
  statusClass,
  statusOf,
} from "./helpers";
import { LandingRowActions } from "./landing-row-actions";
import { useLandingCollection } from "./landing-collection-context";

export function RowGlyph({ row }: { row: AdminCollectionRow }) {
  if ("imageUrl" in row) {
    return (
      <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border-primary bg-surface-tertiary">
        <img
          src={row.imageUrl}
          alt={row.alt}
          loading="lazy"
          className="size-full object-cover"
        />
      </span>
    );
  }
  if ("icon" in row) {
    if (!row.icon) {
      return (
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-content-tertiary">
          <Sparkles className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
      );
    }
    return (
      <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-pill border border-border-primary bg-accent-subtle/60 text-accent">
        <GroupGlyph name={row.icon} className="size-5" />
      </span>
    );
  }
  if ("value" in row) {
    return (
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-dash-title font-black text-copper">
        {row.value}
      </span>
    );
  }
  return (
    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-content-tertiary">
      <ImageIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

function StatusBadge({ row }: { row: AdminCollectionRow }) {
  const t = useTranslations();
  const state = statusOf(row);
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${/* eslint-disable-line security/detect-object-injection -- typed status class lookup */ statusClass[state]}`}
    >
      {t(`landingAdmin.statuses.${state}`)}
    </span>
  );
}

function OrderBadge({ row }: { row: AdminCollectionRow }) {
  return (
    <span className="inline-flex min-w-8 items-center justify-center rounded-pill bg-surface-tertiary px-2 py-1 text-dash-caption font-bold text-content-secondary">
      {row.displayOrder}
    </span>
  );
}

function CollectionErrorState() {
  const t = useTranslations();
  const { load, debouncedSearch, status, page } = useLandingCollection();
  return (
    <tr>
      <td colSpan={5} className="px-6 py-14">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle
            className="size-8 text-error"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="mt-4 text-dash-body font-semibold text-content-primary">
            {t("landingAdmin.errorTitle")}
          </p>
          <p className="mt-1 text-dash-caption text-content-secondary">
            {t("landingAdmin.errorDescription")}
          </p>
          <button
            type="button"
            onClick={() => void load({ search: debouncedSearch, status, page })}
            className="mt-5 inline-flex items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 min-h-10 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RefreshCw className="size-4" strokeWidth={2} aria-hidden="true" />
            {t("landingAdmin.retry")}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function LandingCollectionEmptyState() {
  const t = useTranslations();
  const { data, debouncedSearch, status } = useLandingCollection();

  if (data.items.length > 0) return null;

  const filtering = Boolean(debouncedSearch || status !== "all");

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-control bg-surface-tertiary">
        <Sparkles
          className="h-8 w-8 text-content-tertiary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <p className="text-dash-body text-content-secondary">
        {filtering ? t("landingAdmin.emptySearch") : t("landingAdmin.empty")}
      </p>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-12 shrink-0 animate-pulse rounded-pill bg-surface-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded-control bg-surface-tertiary" />
        <div className="h-2.5 w-1/4 animate-pulse rounded-control bg-surface-tertiary/70" />
      </div>
    </div>
  );
}

export function LandingCollectionDesktopTable() {
  const t = useTranslations();
  const {
    data,
    isLoading,
    hasLoadFailed,
    canWrite,
    selectedIds,
    allVisibleSelected,
    selectAllRef,
    toggleRowSelection,
    togglePageSelection,
  } = useLandingCollection();

  if (hasLoadFailed) {
    return (
      <table className="w-full text-start">
        <tbody>
          <CollectionErrorState />
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-start">
      <thead>
        <tr className="border-b border-border-primary bg-surface-secondary/50 text-dash-caption font-bold uppercase tracking-wide text-content-tertiary">
          <th className="w-14 px-6 py-4 text-center">
            <SelectionCheckbox
              ref={selectAllRef}
              checked={allVisibleSelected}
              onChange={togglePageSelection}
              label={t("landingAdmin.selectAllPage")}
            />
          </th>
          <th className="px-3 py-4 text-start">
            {t("landingAdmin.table.title")}
          </th>
          <th className="px-3 py-4 text-start">
            {t("landingAdmin.table.meta")}
          </th>
          <th className="px-3 py-4 text-center">
            {t("landingAdmin.table.order")}
          </th>
          <th className="px-3 py-4 text-center">
            {t("landingAdmin.table.status")}
          </th>
          <th className="w-16 px-6 py-4 text-end">
            <span className="sr-only">{t("landingAdmin.actions.menu")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-primary">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <RowSkeleton />
                </td>
              </tr>
            ))
          : data.items.length === 0
            ? (
                <tr>
                  <td colSpan={6}>
                    <LandingCollectionEmptyState />
                  </td>
                </tr>
              )
              : data.items.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isSelected ? "bg-accent-subtle/40" : "hover:bg-surface-tertiary/40"
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <SelectionCheckbox
                        checked={isSelected}
                        onChange={() => toggleRowSelection(row.id)}
                        label={t("landingAdmin.selectRow")}
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <RowGlyph row={row} />
                        <div className="min-w-0">
                          <p className="truncate text-dash-body font-semibold text-accent">
                            {rowTitle(row)}
                          </p>
                          <p
                            dir="ltr"
                            className="truncate text-end text-dash-caption text-content-tertiary"
                          >
                            {row.key}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="line-clamp-2 text-dash-body-sm text-content-secondary">
                        {rowMeta(row)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <OrderBadge row={row} />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <StatusBadge row={row} />
                    </td>
                    <td className="px-6 py-4 text-end">
                      {canWrite && <LandingRowActions row={row} />}
                    </td>
                  </tr>
                );
              })}
      </tbody>
    </table>
  );
}
