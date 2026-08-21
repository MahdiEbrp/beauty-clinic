"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminCareGuide } from "@/lib/services/care-guides-types";
import type { DestructiveConfirm } from "./types";
import type { CareGuidesListState } from "./use-care-guides-list";

export interface CareGuidesActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (
    target: AdminCareGuide,
    patch: { isActive?: boolean },
  ) => Promise<void>;
  deleteGuide: (row: AdminCareGuide) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useCareGuidesActions(
  list: CareGuidesListState,
): CareGuidesActionsState {
  const t = useTranslations();
  const { load, debouncedSearch, status, page } = list;

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

  const refresh = () => load({ search: debouncedSearch, status, page });

  const runAction = async (
    target: AdminCareGuide,
    patch: { isActive?: boolean },
  ) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("careGuides.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/care-guides/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("action_failed");
      await refresh();
      toast.success(t("careGuides.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("careGuides.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteGuide = async (row: AdminCareGuide) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("careGuides.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/care-guides/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      await refresh();
      toast.success(t("careGuides.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("careGuides.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("careGuides.deactivateDialog.title", {
            name: confirm.guide.name,
          })
        : t("careGuides.actions.deleteConfirm", {
            name: confirm.guide.name,
          })
      : confirm
        ? t(`careGuides.bulk.confirm.${confirm.action}`)
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("careGuides.deactivateDialog.description")
        : t("careGuides.bulk.confirmDescription")
      : confirm
        ? t("careGuides.bulk.confirmDescription")
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
    deleteGuide,
    confirmTitle,
    confirmDescription,
  };
}
