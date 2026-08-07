"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { bulkDownload, copyEntries, trashEntries } from "./bulk-ops";
import { filesCache } from "./files-cache";
import type { EntryMeta } from "./types";
import type { FilesListState } from "./use-files-list";

export interface FilesBulkState {
  busy: boolean;
  copyTargets: EntryMeta[] | null;
  setCopyTargets: (value: EntryMeta[] | null) => void;
  downloadSelected: () => void;
  copySelected: (targetFolder: string) => Promise<void>;
  trashSelected: () => Promise<void>;
}

/** Multi-select bulk operations live apart from single-entry actions so both
 * stay under the file length limit. */
export function useFilesBulk(list: FilesListState): FilesBulkState {
  const t = useTranslations();
  const [busy, setBusy] = useState(false);
  const [copyTargets, setCopyTargets] = useState<EntryMeta[] | null>(null);
  const busyRef = useRef(false);

  const withBusy = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await action();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const downloadSelected = () => {
    bulkDownload(list.path, list.selectedEntries);
  };

  const copySelected = async (targetFolder: string) => {
    if (!copyTargets || copyTargets.length === 0) return;
    const targets = copyTargets;
    await withBusy(async () => {
      const result = await copyEntries(list.path, targets, targetFolder);
      setCopyTargets(null);
      filesCache.invalidate(list.path);
      filesCache.invalidate(targetFolder);
      await list.load();
      list.clearSelection();
      if (result.failed > 0) {
        toast.error(t("files.toast.partialFailure", { count: result.failed }));
      } else {
        toast.success(t("files.toast.copiedMany", { count: result.ok }));
      }
    });
  };

  const trashSelected = async () => {
    const targets = list.selectedEntries;
    if (targets.length === 0) return;
    await withBusy(async () => {
      const result = await trashEntries(list.path, targets);
      filesCache.invalidate(list.path);
      await list.load();
      list.clearSelection();
      if (result.failed > 0) {
        toast.error(t("files.toast.partialFailure", { count: result.failed }));
      } else {
        toast.success(t("files.toast.trashedMany", { count: result.ok }));
      }
    });
  };

  return {
    busy,
    copyTargets,
    setCopyTargets,
    downloadSelected,
    copySelected,
    trashSelected,
  };
}