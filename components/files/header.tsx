"use client";

import { useTranslations } from "next-intl";
import { FolderPlus, FilePlus, Trash2, Upload, X } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { useFiles } from "./files-context";

export function FilesHeader() {
  const t = useTranslations();
  const { canWrite, canManage, entries, view, setView, setUploadOpen, setNewFolderOpen, setNewFileOpen } =
    useFiles();

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
              className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-pill border px-3 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                view === "trash"
                  ? "border-error/30 bg-error/10 text-error"
                  : "border-border-interactive bg-surface-secondary text-content-secondary hover:bg-surface-tertiary hover:text-accent"
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

      {entries.length > 0 && view === "browse" && (
        <p className="mt-3 text-dash-caption font-bold text-content-tertiary">
          {t("files.searchPlaceholder", { count: entries.length })}
        </p>
      )}
    </header>
  );
}
