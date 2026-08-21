"use client";

import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";
import { statusOf, SelectionCheckbox } from "./helpers";
import { CareGuideItemRowActions } from "./row-actions";
import { CareGuideItemRowSkeleton } from "./skeletons";
import { useCareGuideItems } from "./care-guide-items-context";

function StatusBadge({ item }: { item: AdminCareGuideItem }) {
  const t = useTranslations();
  const state = statusOf(item);
  const cls =
    state === "active"
      ? "bg-success/10 text-success border-success/30"
      : "bg-surface-tertiary text-content-secondary border-border-primary";
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${cls}`}
    >
      {t(`careGuideItems.statuses.${state}`)}
    </span>
  );
}

function DesktopRow({ row }: { row: AdminCareGuideItem }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    isSyncing,
    busyId,
    selectedIds,
    toggleItemSelection,
  } = useCareGuideItems();

  const showActions = canWrite || canManage;

  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-5">
        <SelectionCheckbox
          checked={selectedIds.includes(row.id)}
          disabled={isSyncing(row.id)}
          onChange={() => toggleItemSelection(row.id)}
          label={t("careGuideItems.bulk.selectItem", { name: row.title })}
        />
      </td>
      <td className="px-2 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-pill border ${
              row.highlighted
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-border-primary bg-surface-tertiary text-copper-strong"
            }`}
            aria-hidden="true"
          >
            <Sparkles className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-dash-body font-semibold text-accent truncate">
              {row.title}
            </p>
            <p className="text-dash-caption text-content-tertiary truncate">
              {row.translations.en?.title || "—"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-5">
        <span className="text-dash-body-sm text-content-secondary truncate">
          {row.guideName || "—"}
        </span>
      </td>
      <td className="hidden px-4 py-5 xl:table-cell">
        <p className="text-dash-body-sm text-content-secondary">{row.displayOrder}</p>
      </td>
      <td className="px-4 py-5">
        <StatusBadge item={row} />
      </td>
      {showActions && (
        <td className="w-16 px-2 py-5">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {busyId === row.id && (
              <Loader2
                className="w-4 h-4 animate-spin text-accent"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
            <CareGuideItemRowActions row={row} />
          </div>
        </td>
      )}
    </tr>
  );
}

export function CareGuideItemsDesktopTable() {
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
  } = useCareGuideItems();

  const showActions = canWrite || canManage;

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-140 table-fixed text-start">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
            <th scope="col" className="w-12 px-4 py-4 text-start font-bold">
              <SelectionCheckbox
                ref={selectAllRef}
                checked={allVisibleSelected}
                indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                disabled={visibleIds.length === 0}
                onChange={togglePageSelection}
                label={t("careGuideItems.bulk.selectPage")}
              />
            </th>
            <th scope="col" className="w-[40%] px-2 py-4 text-start font-bold xl:w-[34%]">
              {t("careGuideItems.table.item")}
            </th>
            <th scope="col" className="w-[24%] px-4 py-4 text-start font-bold xl:w-[20%]">
              {t("careGuideItems.table.guide")}
            </th>
            <th scope="col" className="hidden w-[14%] px-4 py-4 text-start font-bold xl:table-cell">
              {t("careGuideItems.table.displayOrder")}
            </th>
            <th scope="col" className="w-[18%] px-4 py-4 text-start font-bold xl:w-[14%]">
              {t("careGuideItems.table.status")}
            </th>
            {showActions && (
              <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
                <span className="sr-only">{t("careGuideItems.table.actions")}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {data.items.map((row) =>
            isSyncing(row.id) ? (
              <tr key={row.id} className="border-b border-border-primary">
                <td colSpan={showActions ? 6 : 5} className="px-4 py-5">
                  <CareGuideItemRowSkeleton />
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
