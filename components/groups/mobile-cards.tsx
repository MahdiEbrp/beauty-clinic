"use client";

import { useTranslations } from "next-intl";
import type { AdminServiceGroup } from "@/lib/services/types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { statusClass, statusOf, SelectionCheckbox } from "./helpers";
import { GroupRowActions } from "./row-actions";
import { GroupCardSkeleton } from "./skeletons";
import { useGroups } from "./groups-context";

function MobileCard({ row }: { row: AdminServiceGroup }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    isSyncing,
    selectionMode,
    selectedIds,
    toggleGroupSelection,
  } = useGroups();

  const state = statusOf(row);
  const showActions = canWrite || canManage;

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        {selectionMode && (
          <SelectionCheckbox
            checked={selectedIds.includes(row.id)}
            disabled={isSyncing(row.id)}
            onChange={() => toggleGroupSelection(row.id)}
            label={t("serviceGroups.bulk.selectGroup", { name: row.name })}
          />
        )}
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
          aria-hidden="true"
        >
          <GroupGlyph name={row.icon ?? "Sparkles"} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-dash-body font-bold text-accent">{row.name}</p>
          <p className="truncate text-dash-caption text-content-tertiary">
            {row.translations.en?.name || "—"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${ statusClass[state]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {t(`serviceGroups.statuses.${state}`)}
            </span>
            <span className="inline-flex items-center rounded-control border border-border-primary bg-surface-tertiary/60 px-2 py-0.5 text-dash-caption font-medium text-content-secondary">
              {t("serviceGroups.table.categories")}: {row.categoryCount}
            </span>
            <span className="text-dash-caption text-content-tertiary">
              {t("serviceGroups.table.displayOrder")}: {row.displayOrder}
            </span>
          </div>
        </div>
        {showActions && <div className="shrink-0 self-center">{<GroupRowActions row={row} />}</div>}
      </div>
    </article>
  );
}

export function GroupsMobileCards() {
  const { data, isSyncing } = useGroups();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <GroupCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
