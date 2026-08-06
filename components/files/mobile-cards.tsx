"use client";

import { useTranslations, useFormatter } from "next-intl";
import type { EntryMeta } from "./types";
import { entryColor, formatBytes, renderEntryIcon } from "./helpers";
import { EntryActions } from "./entry-actions";
import { useFiles } from "./files-context";
import { EntryCardSkeleton } from "./skeletons";

function MobileCard({ entry }: { entry: EntryMeta }) {
  const t = useTranslations();
  const format = useFormatter();
  const { busy, openEntry } = useFiles();

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => openEntry(entry)}
          disabled={busy}
          aria-label={entry.name}
          className="flex min-w-0 flex-1 items-center gap-3 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {renderEntryIcon(entry, `size-8 shrink-0 ${entryColor(entry)}`)}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-dash-body font-bold text-accent">
              {entry.name}
            </span>
            <span className="mt-0.5 block truncate text-dash-caption text-content-tertiary">
              {entry.isDir
                ? t("files.types.folder")
                : formatBytes(entry.size)}
              <span aria-hidden="true"> · </span>
              {format.relativeTime(entry.mtimeMs, new Date())}
            </span>
          </span>
        </button>
        <div className="shrink-0 self-center">
          <EntryActions entry={entry} />
        </div>
      </div>
    </article>
  );
}

export function FilesMobileCards() {
  const { entries, isLoading } = useFiles();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <EntryCardSkeleton key={index} />
          ))
        : entries.map((entry) => <MobileCard key={entry.name} entry={entry} />)}
    </div>
  );
}
