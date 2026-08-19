"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { AdminRule } from "@/lib/services/rules-types";

import GroupGlyph from "@/components/create-group/GroupGlyph";

import { statusClass, statusOf, SelectionCheckbox } from "./helpers";
import { RuleRowActions } from "./row-actions";
import { RuleCardSkeleton } from "./skeletons";
import { useRules } from "./rules-context";

function MobileCard({ row }: { row: AdminRule }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    isSyncing,
    selectionMode,
    selectedIds,
    toggleRuleSelection,
  } = useRules();

  const state = statusOf(row);
  const showActions = canWrite || canManage;

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        {selectionMode && (
          <SelectionCheckbox
            checked={selectedIds.includes(row.id)}
            disabled={isSyncing(row.id)}
            onChange={() => toggleRuleSelection(row.id)}
            label={t("dashboardRules.bulk.selectGroup", { name: row.name })}
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
              {t(`dashboardRules.statuses.${state}`)}
            </span>
            {row.highlighted && (
              <span className="inline-flex items-center gap-1 rounded-control border border-border-primary bg-copper/10 px-2 py-0.5 text-dash-caption font-bold text-copper-strong">
                <Sparkles className="size-3" aria-hidden="true" />
                {t("dashboardRules.table.highlighted")}
              </span>
            )}
            <span className="text-dash-caption text-content-tertiary">
              {t("dashboardRules.table.displayOrder")}: {row.displayOrder}
            </span>
          </div>
        </div>
        {showActions && <div className="shrink-0 self-center">{<RuleRowActions row={row} />}</div>}
      </div>
    </article>
  );
}

export function RulesMobileCards() {
  const { data, isSyncing } = useRules();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <RuleCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
