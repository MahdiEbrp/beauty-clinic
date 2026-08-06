"use client";

import { useTranslations } from "next-intl";
import {
  Copy,
  Download,
  FilePenLine,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isEditable, isPreviewable, joinRel } from "./helpers";
import { useFiles } from "./files-context";
import type { EntryMeta } from "./types";

export function EntryActions({ entry }: { entry: EntryMeta }) {
  const t = useTranslations();
  const {
    canWrite,
    canManage,
    busy,
    path,
    downloadEntry,
    setEditorTarget,
    setRenameTarget,
    setCopyTarget,
    setConfirm,
  } = useFiles();

  const editable = isEditable(entry);
  const previewable = isPreviewable(entry);

  const menuLabel = t("files.actions.menu", { name: entry.name });

  const rowButton = (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        disabled={busy}
        aria-label={menuLabel}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
      >
        <MoreVertical className="size-5" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
  );

  if (!canWrite && !canManage) return rowButton;

  return (
    <DropdownMenu modal={false}>
      {rowButton}
      <DropdownMenuContent align="end">
        {!entry.isDir && (
          <DropdownMenuItem onSelect={() => downloadEntry(entry)} className="text-accent">
            <Download className="size-4" aria-hidden="true" />
            <span>{t("files.actions.download")}</span>
          </DropdownMenuItem>
        )}
        {!entry.isDir && editable && (
          <DropdownMenuItem onSelect={() => setEditorTarget(entry)} className="text-accent">
            <FilePenLine className="size-4" aria-hidden="true" />
            <span>{t("files.actions.edit")}</span>
          </DropdownMenuItem>
        )}
        {!entry.isDir && previewable && !editable && (
          <DropdownMenuItem
            onSelect={() => {
              const qs = new URLSearchParams({ path: joinRel(path, entry.name) });
              window.open(`/api/v1/files/download?${qs.toString()}`, "_blank", "noopener,noreferrer");
            }}
            className="text-accent"
          >
            <FilePenLine className="size-4" aria-hidden="true" />
            <span>{t("files.actions.preview")}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {canWrite && (
          <DropdownMenuItem onSelect={() => setRenameTarget(entry)} className="text-accent">
            <Pencil className="size-4" aria-hidden="true" />
            <span>{t("files.actions.rename")}</span>
          </DropdownMenuItem>
        )}
        {canWrite && (
          <DropdownMenuItem onSelect={() => setCopyTarget(entry)} className="text-accent">
            <Copy className="size-4" aria-hidden="true" />
            <span>{t("files.actions.copy")}</span>
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setConfirm({ kind: "trash", entry })}
              className="text-error focus:bg-error/10 focus:text-error"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span>{t("files.actions.trash")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
