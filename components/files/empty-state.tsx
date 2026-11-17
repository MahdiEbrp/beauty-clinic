"use client";

import { useTranslations } from "next-intl";
import { FolderPlus, FilePlus, FolderOpen, Upload } from "lucide-react";
import { useFiles } from "./files-context";

export function FilesEmptyState() {
  const t = useTranslations();
  const { entries, visibleEntries, entryType, setSearchQuery, setEntryType, canWrite, setUploadOpen, setNewFolderOpen, setNewFileOpen } =
    useFiles();

  if (entries.length > 0) {
    if (visibleEntries.length > 0) return null;
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <p className="text-dash-body font-semibold text-content-secondary">{t("files.noFilterResults")}</p>
        <button type="button" onClick={() => { setSearchQuery(""); setEntryType("all"); }} className="mt-3 rounded-pill border border-border-interactive px-4 py-2 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          {t("files.clearFilters")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div className="flex size-16 items-center justify-center rounded-control bg-surface-tertiary">
        <FolderOpen
          className="size-8 text-content-tertiary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <p className="mt-6 text-dash-body text-content-secondary">
        {t("files.emptyTitle")}
      </p>
      <p className="mt-1 max-w-72 text-dash-caption text-content-tertiary">
        {t("files.emptyDescription")}
      </p>
      {canWrite && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Upload className="size-4" aria-hidden="true" />
            {t("files.upload")}
          </button>
          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-4 py-2.5 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <FolderPlus className="size-4" aria-hidden="true" />
            {t("files.newFolder")}
          </button>
          <button
            type="button"
            onClick={() => setNewFileOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-4 py-2.5 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <FilePlus className="size-4" aria-hidden="true" />
            {t("files.newFile")}
          </button>
        </div>
      )}
    </div>
  );
}
