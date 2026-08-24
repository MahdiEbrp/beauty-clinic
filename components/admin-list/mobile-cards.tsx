"use client";

import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import { ChevronLeft } from "lucide-react";
import { useAdminListContext } from "./context";
import { SelectionCheckbox } from "./helpers";
import { AdminListRowActions } from "./row-actions";

export function AdminListMobileCards<T extends { id: string }>() {
  const t = asTranslate(useTranslations());
  const ctx = useAdminListContext<T>();
  const { config, data, selectionMode, toggleRowSelection, selectedIds, isLoading, isSyncing } = ctx;

  if (data.items.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-dash-body-sm text-content-tertiary">
          {t(`${config.namespace}.loading`)}
        </p>
      </div>
    );
  }

  return (
    <ul role="list" className="divide-y divide-border-primary">
      {data.items.map((row) => {
        const syncing = isSyncing(row.id);
        return (
          <li
            key={row.id}
            className={`flex items-start gap-3 px-4 py-3 sm:px-6 ${syncing ? "opacity-60" : ""}`}
          >
            {selectionMode && (
              <SelectionCheckbox
                checked={selectedIds.includes(row.id)}
                indeterminate={false}
                onChange={() => toggleRowSelection(row.id)}
                label={t(`${config.namespace}.selectRow`, { name: row.id })}
              />
            )}
            <div className="min-w-0 flex-1">{config.renderMobileCard(row)}</div>
            <div className="shrink-0">
              <AdminListRowActions row={row} />
            </div>
            <ChevronLeft className="size-4 shrink-0 self-center text-content-tertiary rtl-mirror rtl:rotate-180" aria-hidden="true" />
          </li>
        );
      })}
      {isLoading && <li className="px-4 py-3 text-center text-dash-caption text-content-tertiary">{t(`${config.namespace}.loading`)}</li>}
    </ul>
  );
}
