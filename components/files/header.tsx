"use client";

import { useTranslations } from "next-intl";
import {
  Copy,
  Download,
  FilePlus,
  FolderPlus,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { useFiles } from "./files-context";

export function FilesHeader() {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    busy,
    entries,
    view,
    setView,
    setUploadOpen,
    setNewFolderOpen,
    setNewFileOpen,
    selectedEntries,
    anySelected,
    clearSelection,
    downloadSelected,
    setCopyTargets,
    setConfirm,
    isRefreshing,
  } = useFiles();

  const hasFiles = selectedEntries.some((entry) => !entry.isDir);

  const toolbarButton =
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-pill border border-border-interactive bg-surface-secondary px-3 text-dash-caption font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40";

  return (
    <header className="rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t("files.heading")}
          </h1>
          <p className="truncate text-dash-caption text-content-tertiary">
            {view === "trash"
              ? t("files.emptyTrashDescription")
              : t("files.description")}
          </p>
        </div>
        {canWrite && view === "browse" && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
          >
            <Upload className="size-4" aria-hidden="true" />
            {t("files.upload")}
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Breadcrumbs />
        <div className="flex items-center gap-1.5">
          {canWrite && view === "browse" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setNewFolderOpen(true)}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-pill border border-border-interactive bg-surface-secondary px-3 text-dash-caption font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <FolderPlus className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("files.newFolder")}</span>
              </button>
              <button
                type="button"
                onClick={() => setNewFileOpen(true)}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-pill border border-border-interactive bg-surface-secondary px-3 text-dash-caption font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <FilePlus className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("files.newFile")}</span>
              </button>
            </div>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => setView(view === "trash" ? "browse" : "trash")}
              aria-pressed={view === "trash"}
              className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-pill border px-3 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error ${
                view === "trash"
                  ? "border-error bg-error text-content-contrast hover:bg-error/90"
                  : "border-error/40 bg-error/10 text-error hover:bg-error/20"
              }`}
            >
              {view === "trash" ? (
                <X className="size-4" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {view === "trash" ? t("files.browse") : t("files.trash")}
              </span>
            </button>
          )}
        </div>
      </div>

      {anySelected && view === "browse" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-accent/25 bg-accent/5 px-3 py-2">
          <span className="text-dash-caption font-bold text-accent">
            {t("files.bulk.selected", { count: selectedEntries.length })}
          </span>
          <span className="h-4 w-px bg-border-interactive" aria-hidden="true" />
          {hasFiles && (
            <button
              type="button"
              onClick={downloadSelected}
              disabled={busy}
              className={toolbarButton}
            >
              <Download className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("files.bulk.download")}</span>
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              onClick={() => setCopyTargets(selectedEntries)}
              disabled={busy}
              className={toolbarButton}
            >
              <Copy className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("files.bulk.copy")}</span>
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => setConfirm({ kind: "trashMany", entries: selectedEntries })}
              disabled={busy}
              className={`${toolbarButton} border-error/30 text-error hover:bg-error/10`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("files.bulk.trash")}</span>
            </button>
          )}
          <button
            type="button"
            onClick={clearSelection}
            disabled={busy}
            aria-label={t("files.bulk.clear")}
            className="ms-auto inline-flex min-h-9 items-center justify-center rounded-pill p-1.5 text-content-tertiary transition hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {entries.length > 0 && view === "browse" && (
        <p className="mt-3 flex items-center gap-2 text-dash-caption font-bold text-content-secondary">
          <span>{t("files.searchPlaceholder", { count: entries.length })}</span>
          {isRefreshing && (
            <>
              <Loader2 className="size-3.5 animate-spin text-accent" aria-hidden="true" />
              <span className="sr-only">{t("files.refreshing")}</span>
            </>
          )}
        </p>
      )}
    </header>
  );
}
