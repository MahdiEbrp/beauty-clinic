"use client";

import { useTranslations } from "next-intl";
import { File, Folder, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { useFiles } from "./files-context";
import { TrashRowSkeleton } from "./skeletons";

export function TrashList() {
  const t = useTranslations();
  const {
    trashItems,
    isLoading,
    canManage,
    busy,
    restoreEntry,
    setConfirm,
  } = useFiles();

  if (isLoading) {
    return (
      <div className="grid gap-2.5 py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <TrashRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (trashItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="flex size-16 items-center justify-center rounded-control bg-surface-tertiary">
          <Trash2
            className="size-8 text-content-tertiary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <p className="mt-6 text-dash-body text-content-secondary">
          {t("files.emptyTrashTitle")}
        </p>
        <p className="mt-1 max-w-72 text-dash-caption text-content-tertiary">
          {t("files.emptyTrashDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 py-3">
      {trashItems.map((item) => {
        const isFolder = item.originalPath.endsWith("/") || !/\./.test(item.originalPath.split("/").pop() ?? "");
        return (
          <article
            key={item.trashPath}
            className="flex items-center gap-3 rounded-card border border-border-primary bg-surface-secondary p-3"
          >
            {isFolder ? (
              <Folder className="size-8 shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
            ) : (
              <File className="size-8 shrink-0 text-content-tertiary" strokeWidth={2} aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-dash-body font-bold text-accent" dir="ltr">
                {item.originalPath.split("/").pop()}
              </p>
              <p className="mt-0.5 truncate text-dash-caption text-content-tertiary" dir="ltr">
                {item.originalPath || "/"}
              </p>
            </div>
            {canManage && (
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void restoreEntry(item)}
                  aria-label={t("files.actions.restore")}
                  className="inline-flex size-11 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary text-success transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="size-5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirm({ kind: "deleteForever", item })}
                  aria-label={t("files.actions.deleteForever")}
                  className="inline-flex size-11 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary text-error transition hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:pointer-events-none disabled:opacity-40"
                >
                  <Trash2 className="size-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
