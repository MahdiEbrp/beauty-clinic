"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { AdminServiceCategory } from "@/lib/services/types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { statusClass, statusOf } from "./helpers";
import { CategoryCardSkeleton } from "./skeletons";
import { CategoryRowActions } from "./row-actions";
import { CategoriesEmptyState } from "./empty-state";
import { useCategories } from "./categories-context";

function CategoryCardGlyph({ category }: { category: AdminServiceCategory }) {
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

function CategoryCard({ category }: { category: AdminServiceCategory }) {
  const t = useTranslations();
  const { canWrite, isSyncing } = useCategories();
  const state = statusOf(category);

  return (
    <article
      className={`flex items-start gap-3 rounded-card border border-border-primary bg-surface-secondary p-3.5 ${isSyncing(category.id) ? "opacity-60" : ""}`}
    >
      <CategoryCardGlyph category={category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-dash-body font-semibold text-accent">
            {category.name}
          </h3>
          <span
            className={`shrink-0 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${ statusClass[state]}`}
          >
            {t(`serviceCategories.statuses.${state}`)}
          </span>
        </div>
        <p dir="ltr" className="mt-0.5 truncate text-end text-dash-caption text-content-tertiary">
          {category.slug}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-dash-caption text-content-secondary">
          <span>{category.groupName}</span>
          <span>
            {t("serviceCategories.table.services")}: {category.serviceCount}
          </span>
        </div>
      </div>
      {canWrite && (
        <div className="shrink-0">
          <CategoryRowActions row={category} />
        </div>
      )}
    </article>
  );
}

export function CategoriesMobileCards() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed } = useCategories();

  return (
    <div className="space-y-3 p-3">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <CategoryCardSkeleton key={index} />
          ))}
        </div>
      ) : hasLoadFailed ? (
        <div className="py-10 text-center text-dash-body text-content-secondary">
          {t("serviceCategories.errorTitle")}
        </div>
      ) : data.items.length === 0 ? (
        <CategoriesEmptyState />
      ) : (
        data.items.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))
      )}
    </div>
  );
}
