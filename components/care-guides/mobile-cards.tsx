"use client";

import { useTranslations } from "next-intl";
import type { AdminCareGuide } from "@/lib/services/care-guides-types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { statusClass, statusOf, SelectionCheckbox } from "./helpers";
import { GuideRowActions } from "./row-actions";
import { GuideCardSkeleton } from "./skeletons";
import { useCareGuides } from "./care-guides-context";

function MobileCard({ row }: { row: AdminCareGuide }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    isSyncing,
    selectionMode,
    selectedIds,
    toggleGuideSelection,
  } = useCareGuides();

  const state = statusOf(row);
  const showActions = canWrite || canManage;

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        {selectionMode && (
          <SelectionCheckbox
            checked={selectedIds.includes(row.id)}
            disabled={isSyncing(row.id)}
            onChange={() => toggleGuideSelection(row.id)}
            label={t("careGuides.bulk.selectGuide", { name: row.name })}
          />
        )}
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
          aria-hidden="true"
        >
          <GroupGlyph name={row.icon ?? "BookOpen"} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-dash-body font-bold text-accent">{row.name}</p>
          <p className="truncate text-dash-caption text-content-tertiary">
            {row.translations.en?.name || "—"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${statusClass[state]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {t(`careGuides.statuses.${state}`)}
            </span>
            <span className="inline-flex items-center rounded-control border border-border-primary bg-surface-tertiary/60 px-2 py-0.5 text-dash-caption font-medium text-content-secondary">
              {t("careGuides.table.items")}: {row.itemCount}
            </span>
            <span className="text-dash-caption text-content-tertiary">
              {t("careGuides.table.displayOrder")}: {row.displayOrder}
            </span>
          </div>
        </div>
        {showActions && (
          <div className="shrink-0 self-center">
            <GuideRowActions row={row} />
          </div>
        )}
      </div>
    </article>
  );
}

export function CareGuidesMobileCards() {
  const { data, isSyncing } = useCareGuides();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <GuideCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
