"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, FolderOpen } from "lucide-react";
import type { EntryMeta } from "./types";
import { entryColor, formatBytes, renderEntryIcon } from "./helpers";
import { RelativeTime } from "@/components/ui/relative-time";
import { EntryActions } from "./entry-actions";
import { useFiles } from "./files-context";
import { EntryCardSkeleton } from "./skeletons";

function MobileCard({ entry }: { entry: EntryMeta }) {
  const t = useTranslations();
  const { busy, openEntry, isSelected, toggleSelect } = useFiles();
  const selected = isSelected(entry.name);

  return (
    <article
      className={`rounded-card border p-3 transition-colors ${
        selected
          ? "border-accent/40 bg-accent/10"
          : "border-border-primary bg-surface-secondary"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelect(entry.name)}
          aria-label={t("files.actions.select", { name: entry.name })}
          className="size-5 shrink-0 accent-accent"
        />
        <button
          type="button"
          onClick={() => toggleSelect(entry.name)}
          aria-label={t("files.actions.select", { name: entry.name })}
          className="flex min-w-0 flex-1 items-center gap-3 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {renderEntryIcon(entry, `size-8 shrink-0 ${entryColor(entry)}`)}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-dash-body font-bold text-accent">
              {entry.name}
            </span>
            <span className="mt-0.5 block truncate text-dash-caption text-content-secondary">
              {entry.isDir ? t("files.types.folder") : formatBytes(entry.size)}
              <span aria-hidden="true"> · </span>
              <RelativeTime value={entry.mtimeMs} />
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => openEntry(entry)}
            disabled={busy}
            aria-label={t("files.actions.open", { name: entry.name })}
            className="inline-flex size-11 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
          >
            {entry.isDir ? (
              <FolderOpen className="size-5" aria-hidden="true" />
            ) : (
              <ExternalLink className="size-5 rtl-mirror" aria-hidden="true" />
            )}
          </button>
          <EntryActions entry={entry} />
        </div>
      </div>
    </article>
  );
}

export function FilesMobileCards() {
  const { visibleEntries, isLoading } = useFiles();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <EntryCardSkeleton key={index} />
          ))
        : visibleEntries.map((entry) => <MobileCard key={entry.name} entry={entry} />)}
    </div>
  );
}
