"use client";

import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import { useAdminListContext } from "./context";
import { SelectionCheckbox } from "./helpers";
import { AdminListRowActions } from "./row-actions";

export function AdminListDesktopTable<T extends { id: string }>() {
  const t = asTranslate(useTranslations());
  const ctx = useAdminListContext<T>();
  const { config, data, selectionMode, toggleRowSelection, selectedIds, isSyncing } = ctx;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-dash-body-sm">
        <thead>
          <tr className="border-b border-border-primary text-start text-dash-caption font-bold text-content-secondary uppercase tracking-wider">
            {selectionMode && (
                            <th className="px-3 py-4 text-start w-12">
                <SelectionCheckbox
                  checked={ctx.allVisibleSelected}
                  indeterminate={!ctx.allVisibleSelected && ctx.selectedVisibleCount > 0}
                  disabled={data.items.length === 0}
                  onChange={ctx.togglePageSelection}
                  label={t(`${config.namespace}.selectPage`)}
                />
              </th>
            )}
            {config.columns
              .filter((column) => column.responsive !== "mobile")
              .map((column) => (
                <th key={column.key} className="px-3 py-4 text-start">
                  {t(column.labelKey)}
                </th>
              ))}
            <th className="px-3 py-4 text-start w-11">
              <span className="sr-only">{t(`${config.namespace}.actions.menu`)}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {data.items.map((row) => (
            <tr
              key={row.id}
              className={`transition-colors ${isSyncing(row.id) ? "opacity-60" : ""}`}
            >
              {selectionMode && (
                <td className="px-3 py-3 align-top">
                  <SelectionCheckbox
                    checked={selectedIds.includes(row.id)}
                    indeterminate={false}
                    onChange={() => toggleRowSelection(row.id)}
                    label={t(`${config.namespace}.selectRow`, { name: row.id })}
                  />
                </td>
              )}
              {config.columns
                .filter((column) => column.responsive !== "mobile")
                .map((column) => (
                  <td key={column.key} className="px-3 py-3 align-top">
                    {column.render(row)}
                  </td>
                ))}
              <td className="px-3 py-3 align-top">
                <AdminListRowActions row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
