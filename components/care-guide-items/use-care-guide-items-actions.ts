"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";
import type { DestructiveConfirm } from "./types";
import type { CareGuideItemsListState } from "./use-care-guide-items-list";

export interface CareGuideItemsActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (
    target: AdminCareGuideItem,
    patch: { isActive?: boolean },
  ) => Promise<void>;
  deleteItem: (row: AdminCareGuideItem) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useCareGuideItemsActions(
  list: CareGuideItemsListState,
): CareGuideItemsActionsState {
  const t = useTranslations();
  const { load, debouncedSearch, status, page, guideId } = list;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<DestructiveConfirm | null>(null);

  const setSyncing = (id: string, syncing: boolean) => {
    setSyncingIds((current) => {
      const next = new Set(current);
      if (syncing) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const isSyncing = (id: string) => syncingIds.has(id);

  const refresh = () => load({ search: debouncedSearch, status, page, guideId });

  const runAction = async (
    target: AdminCareGuideItem,
    patch: { isActive?: boolean },
  ) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("careGuideItems.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/care-guide-items/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("action_failed");
      await refresh();
      toast.success(t("careGuideItems.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("careGuideItems.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteItem = async (row: AdminCareGuideItem) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("careGuideItems.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/care-guide-items/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      await refresh();
      toast.success(t("careGuideItems.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("careGuideItems.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("careGuideItems.deactivateDialog.title", {
            name: confirm.item.title,
          })
        : t("careGuideItems.actions.deleteConfirm", {
            name: confirm.item.title,
          })
      : confirm
        ? t(`careGuideItems.bulk.confirm.${confirm.action}`)
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("careGuideItems.deactivateDialog.description")
        : t("careGuideItems.bulk.confirmDescription")
      : confirm
        ? t("careGuideItems.bulk.confirmDescription")
        : "";

  return {
    busyId,
    setBusyId,
    syncingIds,
    isSyncing,
    setSyncing,
    confirm,
    setConfirm,
    runAction,
    deleteItem,
    confirmTitle,
    confirmDescription,
  };
}
