"use client";

import { useTranslations, useFormatter } from "next-intl";
import type { EntryMeta } from "./types";
import { entryColor, formatBytes, renderEntryIcon } from "./helpers";
import { EntryActions } from "./entry-actions";
import { useFiles } from "./files-context";
import { EntryRowSkeleton } from "./skeletons";

function DesktopRow({ entry }: { entry: EntryMeta }) {
  const t = useTranslations();
  const format = useFormatter();
  const { busy, openEntry } = useFiles();

  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => openEntry(entry)}
          disabled={busy}
          className="flex min-w-0 items-center gap-3 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {renderEntryIcon(entry, `size-6 shrink-0 ${entryColor(entry)}`)}
          <span className="min-w-0">
            <span className="block truncate text-dash-body font-semibold text-accent">
              {entry.name}
            </span>
            <span className="block truncate text-dash-caption text-content-tertiary">
              {entry.isDir ? t("files.types.folder") : t("files.types.file")}
            </span>
          </span>
        </button>
      </td>
      <td className="px-4 py-3">
        <p className="text-dash-body-sm text-content-secondary whitespace-nowrap" dir="ltr">
          {entry.isDir ? "—" : formatBytes(entry.size)}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-dash-body-sm text-content-secondary whitespace-nowrap">
          {format.relativeTime(entry.mtimeMs, new Date())}
        </p>
      </td>
      <td className="w-16 px-2 py-3">
        <div className="flex items-center justify-end gap-2">
          <EntryActions entry={entry} />
        </div>
      </td>
    </tr>
  );
}

export function FilesDesktopTable() {
  const t = useTranslations();
  const { entries, isLoading } = useFiles();

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-130 table-fixed text-start">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
            <th scope="col" className="w-[52%] px-4 py-4 text-start font-bold">
              {t("files.table.name")}
            </th>
            <th scope="col" className="w-[18%] px-4 py-4 text-start font-bold">
              {t("files.table.size")}
            </th>
            <th scope="col" className="w-[22%] px-4 py-4 text-start font-bold">
              {t("files.table.modified")}
            </th>
            <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
              {t("files.table.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-border-primary">
                  <td colSpan={4} className="px-4 py-3">
                    <EntryRowSkeleton />
                  </td>
                </tr>
              ))
            : entries.map((entry) => <DesktopRow key={entry.name} entry={entry} />)}
        </tbody>
      </table>
    </div>
  );
}
