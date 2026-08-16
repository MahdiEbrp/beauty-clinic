"use client";

import { useTranslations } from "next-intl";
import { FilePlus, FolderPlus, Upload } from "lucide-react";
import { useFiles } from "./files-context";

export function FilesMobileActions() {
  const t = useTranslations();
  const { canWrite, canManage, view, setView, setUploadOpen, setNewFolderOpen, setNewFileOpen } =
    useFiles();

  if (!canWrite && !canManage) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed bottom-4 inset-e-4 z-40 flex flex-col items-end gap-2 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {canWrite && view === "browse" && (
          <>
            <button
              type="button"
              onClick={() => setNewFileOpen(true)}
              aria-label={t("files.newFile")}
              className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent shadow-elevation-2 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <FilePlus className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setNewFolderOpen(true)}
              aria-label={t("files.newFolder")}
              className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent shadow-elevation-2 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <FolderPlus className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
        {canManage ? (
          <button
            type="button"
            onClick={() => setView(view === "trash" ? "browse" : "trash")}
            aria-pressed={view === "trash"}
            className={`pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border px-4 text-dash-body-sm font-bold shadow-elevation-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error ${
              view === "trash"
                ? "border-error bg-error text-content-contrast"
                : "border-error/40 bg-error/10 text-error hover:bg-error/20"
            }`}
          >
            {view === "trash" ? t("files.browse") : t("files.trash")}
          </button>
        ) : null}
        {canWrite && view === "browse" && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-4 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Upload className="size-5" aria-hidden="true" />
            {t("files.uploadShort")}
          </button>
        )}
      </div>
      <div aria-hidden="true" className="h-24 md:hidden" />
    </>
  );
}
