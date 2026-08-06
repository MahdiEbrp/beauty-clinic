"use client";

import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import { FilesProvider, useFiles } from "./files-context";
import { FilesHeader } from "./header";
import { FilesDesktopTable } from "./desktop-table";
import { FilesMobileCards } from "./mobile-cards";
import { FilesEmptyState } from "./empty-state";
import { TrashList } from "./trash-list";
import { FilesMobileActions } from "./mobile-actions";
import { FilesConfirmDialogs } from "./confirm-dialogs";
import { NewFolderDialog, NewFileDialog, RenameDialog } from "./name-dialogs";
import { CopyDialog } from "./copy-dialog";
import { UploadDialog } from "./upload-dialog";
import { EditorDialog } from "./editor-dialog";

function FilesErrorBanner() {
  const t = useTranslations();
  const { hasLoadFailed, load } = useFiles();

  if (!hasLoadFailed) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-error/40 bg-error/10 p-4"
    >
      <p className="text-dash-body-sm font-medium text-error">{t("files.error")}</p>
      <button
        type="button"
        onClick={() => void load()}
        className="inline-flex min-h-9 items-center gap-2 rounded-pill border border-error/40 px-4 py-2 text-dash-body-sm font-bold text-error transition hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        <span>{t("files.retry")}</span>
      </button>
    </div>
  );
}

function FilesView() {
  const t = useTranslations();
  const { view, isLoading } = useFiles();

  return (
    <div className="space-y-4 sm:space-y-6">
      <FilesHeader />
      <FilesErrorBanner />

      <section
        className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
        aria-label={t("files.heading")}
      >
        {view === "trash" ? (
          <TrashList />
        ) : (
          <>
            <FilesDesktopTable />
            <FilesMobileCards />
            <FilesEmptyState />
          </>
        )}
        {isLoading && (
          <p className="sr-only" role="status">
            {t("files.loading")}
          </p>
        )}
      </section>

      <FilesMobileActions />
      <FilesConfirmDialogs />
      <NewFolderDialog />
      <NewFileDialog />
      <RenameDialog />
      <CopyDialog />
      <UploadDialog />
      <EditorDialog />
    </div>
  );
}

export default function FilesContent({ user }: { user: AuthUser }) {
  return (
    <FilesProvider user={user}>
      <FilesView />
    </FilesProvider>
  );
}
