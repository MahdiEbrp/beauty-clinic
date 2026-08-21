"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";
import { statusClass, statusOf, SelectionCheckbox } from "./helpers";
import { CareGuideItemRowActions } from "./row-actions";
import { CareGuideItemCardSkeleton } from "./skeletons";
import { useCareGuideItems } from "./care-guide-items-context";

function MobileCard({ row }: { row: AdminCareGuideItem }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    isSyncing,
    selectionMode,
    selectedIds,
    toggleItemSelection,
  } = useCareGuideItems();

  const state = statusOf(row);
  const showActions = canWrite || canManage;

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        {selectionMode && (
          <SelectionCheckbox
            checked={selectedIds.includes(row.id)}
            disabled={isSyncing(row.id)}
            onChange={() => toggleItemSelection(row.id)}
            label={t("careGuideItems.bulk.selectItem", { name: row.title })}
          />
        )}
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-pill border ${
            row.highlighted
              ? "border-warning/40 bg-warning/10 text-warning"
              : "border-border-primary bg-surface-tertiary text-copper-strong"
          }`}
          aria-hidden="true"
        >
          <Sparkles className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-dash-body font-bold text-accent">{row.title}</p>
          <p className="truncate text-dash-caption text-content-tertiary">
            {row.translations.en?.title || "—"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${statusClass[state]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {t(`careGuideItems.statuses.${state}`)}
            </span>
            <span className="inline-flex items-center rounded-control border border-border-primary bg-surface-tertiary/60 px-2 py-0.5 text-dash-caption font-medium text-content-secondary">
              {t("careGuideItems.table.guide")}: {row.guideName || "—"}
            </span>
            <span className="text-dash-caption text-content-tertiary">
              {t("careGuideItems.table.displayOrder")}: {row.displayOrder}
            </span>
          </div>
        </div>
        {showActions && (
          <div className="shrink-0 self-center">
            <CareGuideItemRowActions row={row} />
          </div>
        )}
      </div>
    </article>
  );
}

export function CareGuideItemsMobileCards() {
  const { data, isSyncing } = useCareGuideItems();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <CareGuideItemCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
