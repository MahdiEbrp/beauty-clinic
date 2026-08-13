"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { AdminServiceCategory } from "@/lib/services/types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import {
  SelectionCheckbox,
  statusClass,
  statusOf,
} from "./helpers";
import { CategoryRowSkeleton } from "./skeletons";
import { CategoryRowActions } from "./row-actions";
import { CategoriesEmptyState } from "./empty-state";
import { useCategories } from "./categories-context";

function StatusBadge({ category }: { category: AdminServiceCategory }) {
  const t = useTranslations();
  const state = statusOf(category);
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${/* eslint-disable-line security/detect-object-injection -- typed status class lookup */ statusClass[state]}`}
    >
      {t(`serviceCategories.statuses.${state}`)}
    </span>
  );
}

function CategoryGlyph({ category }: { category: AdminServiceCategory }) {
  if (!category.icon) {
    return (
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-content-tertiary">
        <Sparkles className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-pill border border-border-primary bg-accent-subtle/60 text-accent">
      <GroupGlyph name={category.icon} className="size-5" />
    </span>
  );
}

function CategoriesErrorState() {
  const t = useTranslations();
  const { load, debouncedSearch, status, page } = useCategories();
  return (
    <tr>
      <td colSpan={6} className="px-6 py-14">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle
            className="size-8 text-error"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="mt-4 text-dash-body font-semibold text-content-primary">
            {t("serviceCategories.errorTitle")}
          </p>
          <p className="mt-1 text-dash-caption text-content-secondary">
            {t("serviceCategories.errorDescription")}
          </p>
          <button
            type="button"
            onClick={() => void load({ search: debouncedSearch, status, page })}
            className="mt-5 inline-flex items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 min-h-10 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RefreshCw className="size-4" strokeWidth={2} aria-hidden="true" />
            {t("serviceCategories.retry")}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CategoriesDesktopTable() {
  const t = useTranslations();
  const {
    data,
    isLoading,
    hasLoadFailed,
    canWrite,
    selectedIds,
    allVisibleSelected,
    selectAllRef,
    toggleCategorySelection,
    togglePageSelection,
  } = useCategories();

  if (hasLoadFailed) {
    return (
      <table className="w-full text-start">
        <tbody>
          <CategoriesErrorState />
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
              label={t("serviceCategories.selectAllPage")}
            />
          </th>
          <th className="px-3 py-4 text-start">
            {t("serviceCategories.table.name")}
          </th>
          <th className="px-3 py-4 text-start">
            {t("serviceCategories.table.group")}
          </th>
          <th className="px-3 py-4 text-center">
            {t("serviceCategories.table.services")}
          </th>
          <th className="px-3 py-4 text-center">
            {t("serviceCategories.table.status")}
          </th>
          <th className="w-16 px-6 py-4 text-end">
            <span className="sr-only">{t("serviceCategories.actions.menu")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-primary">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <CategoryRowSkeleton />
                </td>
              </tr>
            ))
          : data.items.length === 0
            ? (
                <tr>
                  <td colSpan={6}>
                    <CategoriesEmptyState />
                  </td>
                </tr>
              )
              : data.items.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                return (
                  <tr
                    key={category.id}
                    className={`transition-colors ${
                      isSelected ? "bg-accent-subtle/40" : "hover:bg-surface-tertiary/40"
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <SelectionCheckbox
                        checked={isSelected}
                        onChange={() => toggleCategorySelection(category.id)}
                        label={t("serviceCategories.selectRow")}
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <CategoryGlyph category={category} />
                        <div className="min-w-0">
                          <p className="truncate text-dash-body font-semibold text-accent">
                            {category.name}
                          </p>
                          <p
                            dir="ltr"
                            className="truncate text-dash-caption text-content-tertiary"
                          >
                            {category.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-dash-body-sm text-content-secondary">
                        {category.groupName}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-pill bg-surface-tertiary px-2 py-1 text-dash-caption font-bold text-content-secondary">
                        {category.serviceCount}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <StatusBadge category={category} />
                    </td>
                    <td className="px-6 py-4 text-end">
                      {canWrite && <CategoryRowActions row={category} />}
                    </td>
                  </tr>
                );
              })}
      </tbody>
    </table>
  );
}
