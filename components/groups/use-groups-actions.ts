"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminServiceGroup } from "@/lib/services/types";
import type { DestructiveConfirm } from "./types";
import type { GroupsListState } from "./use-groups-list";

export interface GroupsActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (
    target: AdminServiceGroup,
    patch: { isActive?: boolean },
  ) => Promise<void>;
  deleteGroup: (row: AdminServiceGroup) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useGroupsActions(list: GroupsListState): GroupsActionsState {
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
    target: AdminServiceGroup,
    patch: { isActive?: boolean },
  ) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("serviceGroups.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/service-groups/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("action_failed");
      await refresh();
      toast.success(t("serviceGroups.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("serviceGroups.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteGroup = async (row: AdminServiceGroup) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("serviceGroups.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/service-groups/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      await refresh();
      toast.success(t("serviceGroups.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("serviceGroups.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("serviceGroups.deactivateDialog.title", {
            name: confirm.group.name,
          })
        : t("serviceGroups.actions.deleteConfirm", {
            name: confirm.group.name,
          })
      : confirm
        ? t(`serviceGroups.bulk.confirm.${confirm.action}`)
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("serviceGroups.deactivateDialog.description")
        : t("serviceGroups.bulk.confirmDescription")
      : confirm
        ? t("serviceGroups.bulk.confirmDescription")
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
    deleteGroup,
    confirmTitle,
    confirmDescription,
  };
}
