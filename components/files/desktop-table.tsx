"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { EntryMeta } from "./types";
import { entryColor, formatBytes, renderEntryIcon } from "./helpers";
import { RelativeTime } from "@/components/ui/relative-time";
import { EntryActions } from "./entry-actions";
import { useFiles } from "./files-context";
import { EntryRowSkeleton } from "./skeletons";

function DesktopRow({ entry }: { entry: EntryMeta }) {
  const t = useTranslations();
  const { openEntry, isSelected, selectOnly, toggleSelect, rangeSelect } = useFiles();
  const selected = isSelected(entry.name);

  const handleSelect = (event: React.MouseEvent) => {
    if (event.shiftKey) rangeSelect(entry.name);
    else if (event.metaKey || event.ctrlKey) toggleSelect(entry.name);
    else selectOnly(entry.name);
  };

  return (
    <tr
      tabIndex={0}
      onClick={(event) => {
        handleSelect(event);
        event.currentTarget.focus();
      }}
      onDoubleClick={() => openEntry(entry)}
      onKeyDown={(event) => {
        if (event.key === "Enter") openEntry(entry);
        else if (event.key === " " && !event.shiftKey) {
          event.preventDefault();
          toggleSelect(entry.name);
        }
      }}
      aria-selected={selected}
      className={`cursor-pointer transition-colors focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
        selected
          ? "bg-accent/10 hover:bg-accent/15"
          : "hover:bg-surface-primary/60"
      }`}
    >
      <td className="w-10 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelect(entry.name)}
          onClick={(event) => event.stopPropagation()}
          aria-label={t("files.actions.select", { name: entry.name })}
          className="size-4 shrink-0 accent-accent"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3 text-start">
          {renderEntryIcon(entry, `size-6 shrink-0 ${entryColor(entry)}`)}
          <span className="min-w-0">
            <span className="block truncate text-dash-body font-semibold text-accent">
              {entry.name}
            </span>
            <span className="block truncate text-dash-caption text-content-secondary">
              {entry.isDir ? t("files.types.folder") : t("files.types.file")}
            </span>
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-dash-body-sm text-content-secondary whitespace-nowrap" dir="ltr">
          {entry.isDir ? "—" : formatBytes(entry.size)}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-dash-body-sm text-content-secondary whitespace-nowrap">
          <RelativeTime value={entry.mtimeMs} />
        </p>
      </td>
      <td className="w-16 px-2 py-3">
        <div
          className="flex items-center justify-end gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <EntryActions entry={entry} />
        </div>
      </td>
    </tr>
  );
}

function SelectAllCheckbox() {
  const t = useTranslations();
  const { entries, allSelected, anySelected, toggleSelectAll } = useFiles();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = anySelected && !allSelected;
  }, [anySelected, allSelected]);

  if (visibleEntries.length === 0) return null;

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={toggleSelectAll}
      onClick={(event) => event.stopPropagation()}
      aria-label={t("files.bulk.selectAll")}
      className="size-4 shrink-0 accent-accent"
    />
  );
}

export function FilesDesktopTable() {
  const t = useTranslations();
  const { visibleEntries, isLoading, selectAll, clearSelection } = useFiles();

  return (
    <div
      className="hidden overflow-x-auto md:block"
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
          event.preventDefault();
          selectAll();
        } else if (event.key === "Escape") {
          clearSelection();
        }
      }}
    >
      <table className="w-full min-w-130 table-fixed text-start">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary text-content-secondary">
            <th scope="col" className="w-10 px-3 py-4">
              <SelectAllCheckbox />
            </th>
            <th scope="col" className="w-[46%] px-4 py-4 text-start text-dash-caption font-bold uppercase tracking-wide">
              {t("files.table.name")}
            </th>
            <th scope="col" className="w-[16%] px-4 py-4 text-start text-dash-caption font-bold uppercase tracking-wide">
              {t("files.table.size")}
            </th>
            <th scope="col" className="w-[20%] px-4 py-4 text-start text-dash-caption font-bold uppercase tracking-wide">
              {t("files.table.modified")}
            </th>
            <th scope="col" className="w-16 px-2 py-4 text-end text-dash-caption font-bold uppercase tracking-wide">
              {t("files.table.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-border-primary">
                  <td colSpan={5} className="px-4 py-3">
                    <EntryRowSkeleton />
                  </td>
                </tr>
              ))
            : visibleEntries.map((entry) => <DesktopRow key={entry.name} entry={entry} />)}
        </tbody>
      </table>
    </div>
  );
}
