"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import type { AdminCareGuide } from "@/lib/services/care-guides-types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { statusOf, statusTextClass, SelectionCheckbox } from "./helpers";
import { GuideRowActions } from "./row-actions";
import { GuideRowSkeleton } from "./skeletons";
import { useCareGuides } from "./care-guides-context";

function DesktopRow({ row }: { row: AdminCareGuide }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    isSyncing,
    busyId,
    selectedIds,
    toggleGuideSelection,
  } = useCareGuides();

  const state = statusOf(row);

  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-5">
        <SelectionCheckbox
          checked={selectedIds.includes(row.id)}
          disabled={isSyncing(row.id)}
          onChange={() => toggleGuideSelection(row.id)}
          label={t("careGuides.bulk.selectGuide", { name: row.name })}
        />
      </td>
      <td className="px-2 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
            aria-hidden="true"
          >
            <GroupGlyph name={row.icon ?? "BookOpen"} size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-dash-body font-semibold text-accent truncate">
              {row.name}
            </p>
            <p className="text-dash-caption text-content-tertiary truncate">
              {row.translations.en?.name || "—"}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-5 lg:table-cell">
        <p className="text-dash-caption text-content-secondary truncate" dir="ltr">
          {row.slug}
        </p>
      </td>
      <td className="px-4 py-5">
        <span className="inline-flex items-center rounded-control border border-border-primary bg-surface-tertiary/60 px-2.5 py-1 text-dash-caption font-bold text-content-secondary">
          {row.itemCount}
        </span>
      </td>
      <td className="hidden px-4 py-5 xl:table-cell">
        <p className="text-dash-body-sm text-content-secondary">{row.displayOrder}</p>
      </td>
      <td className="px-4 py-5">
        <span
          className={`inline-flex items-center gap-1.5 px-0 py-0.5 text-dash-caption font-bold whitespace-nowrap ${statusTextClass[state]}`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t(`careGuides.statuses.${state}`)}
        </span>
      </td>
      {(canWrite || canManage) && (
        <td className="w-16 px-2 py-5">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {busyId === row.id && (
              <Loader2
                className="w-4 h-4 animate-spin text-accent"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
            <GuideRowActions row={row} />
          </div>
        </td>
      )}
    </tr>
  );
}

export function CareGuidesDesktopTable() {
  const t = useTranslations();
  const {
    data,
    canWrite,
    canManage,
    isSyncing,
    selectedVisibleCount,
    allVisibleSelected,
    visibleIds,
    selectAllRef,
    togglePageSelection,
  } = useCareGuides();

  const showActions = canWrite || canManage;

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-155 table-fixed text-start">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
            <th scope="col" className="w-12 px-4 py-4 text-start font-bold">
              <SelectionCheckbox
                ref={selectAllRef}
                checked={allVisibleSelected}
                indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                disabled={visibleIds.length === 0}
                onChange={togglePageSelection}
                label={t("careGuides.bulk.selectPage")}
              />
            </th>
            <th scope="col" className="w-[38%] px-2 py-4 text-start font-bold xl:w-[30%]">
              {t("careGuides.table.guide")}
            </th>
            <th scope="col" className="hidden w-[18%] px-4 py-4 text-start font-bold lg:table-cell">
              {t("careGuides.table.slug")}
            </th>
            <th scope="col" className="w-[20%] px-4 py-4 text-start font-bold xl:w-[14%]">
              {t("careGuides.table.items")}
            </th>
            <th scope="col" className="hidden w-[14%] px-4 py-4 text-start font-bold xl:table-cell">
              {t("careGuides.table.displayOrder")}
            </th>
            <th scope="col" className="w-[18%] px-4 py-4 text-start font-bold xl:w-[14%]">
              {t("careGuides.table.status")}
            </th>
            {showActions && (
              <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
                <span className="sr-only">{t("careGuides.table.actions")}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {data.items.map((row) =>
            isSyncing(row.id) ? (
              <tr key={row.id} className="border-b border-border-primary">
                <td colSpan={showActions ? 7 : 6} className="px-4 py-5">
                  <GuideRowSkeleton />
                </td>
              </tr>
            ) : (
              <DesktopRow key={row.id} row={row} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
