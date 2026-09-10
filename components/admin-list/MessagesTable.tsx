"use client";

import type { ReactNode } from "react";

export type Message = { id: string };

export function MessagesTable({
  items,
  columns,
  selectedIds,
  selectAllChecked,
  onSelectAll,
  renderRow,
}: {
  items: Message[];
  columns: { label: ReactNode; width?: string }[];
  selectedIds: Set<string>;
  selectAllChecked: boolean;
  onSelectAll: () => void;
  renderRow: (item: Message, selected: boolean) => ReactNode;
}) {
  return (
    <table className="w-full min-w-5xl table-fixed text-start">
      <thead>
        <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
          <th scope="col" className="w-10 px-2 py-4">
            <input
              type="checkbox"
              checked={selectAllChecked}
              onChange={onSelectAll}
              className="size-4 rounded border-border-primary accent-accent"
            />
          </th>
          {columns.map((column, index) => (
            <th
              key={index}
              scope="col"
              className={`${
                index === columns.length - 1 ? "max-w-56" : ""
              } ${column.width ?? ""} px-4 py-4 text-start font-bold`}
            >
              {column.label}
            </th>
          ))}
          <th scope="col" className="w-12 px-2 py-4" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border-primary">
        {items.map((item) => renderRow(item, selectedIds.has(item.id)))}
      </tbody>
    </table>
  );
}