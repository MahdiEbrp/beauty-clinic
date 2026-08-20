"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminSetting } from "@/lib/settings/admin";
import type { BulkResult } from "./types";
import type { SettingsListState } from "./use-settings-list";

export type DestructiveConfirm =
  | { kind: "row"; action: "deactivate" | "delete"; setting: AdminSetting }
  | { kind: "bulk"; action: "activate" | "deactivate" | "delete" };

export interface SettingsActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (target: AdminSetting, patch: { isActive?: boolean }) => Promise<void>;
  deleteSetting: (row: AdminSetting) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  bulkDangerous: boolean;
}

export function useSettingsActions(list: SettingsListState): SettingsActionsState {
  const t = useTranslations();
  const {
    load,
    debouncedSearch,
    status,
    page,
    visibleIds,
    selectedIds,
    selectionScope,
    clearSelection,
    bulkAction,
  } = list;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<DestructiveConfirm | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

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

  const runAction = async (target: AdminSetting, patch: { isActive?: boolean }) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("settingsAdmin.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/admin/settings/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("action_failed");
      await refresh();
      toast.success(t("settingsAdmin.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("settingsAdmin.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteSetting = async (row: AdminSetting) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("settingsAdmin.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/admin/settings/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      await refresh();
      toast.success(t("settingsAdmin.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("settingsAdmin.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const executeBulkAction = async () => {
    if (!selectedIds.length && selectionScope === "page") return;
    setConfirm(null);
    setBusyId("bulk");
    const pendingToast = toast.loading(t("settingsAdmin.toast.syncing"));
    const targetIds = selectionScope === "page" ? selectedIds : visibleIds;
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const response = await fetch("/api/v1/admin/settings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: bulkAction,
          scope: selectionScope,
          ids: selectionScope === "page" ? selectedIds : undefined,
          filters:
            selectionScope === "filtered"
              ? { search: debouncedSearch, status }
              : undefined,
        }),
      });
      if (!response.ok) throw new Error("bulk_failed");
      const payload = (await response.json()) as { data: BulkResult };
      if (payload.data.failures.length > 0) setBulkResult(payload.data);
      clearSelection();
      await refresh();
      toast.success(t("settingsAdmin.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("settingsAdmin.toast.error"), { id: pendingToast });
    } finally {
      targetIds.forEach((id) => setSyncing(id, false));
      setBusyId(null);
    }
  };

  const runBulkAction = () => {
    if (bulkAction === "delete") {
      setConfirm({ kind: "bulk", action: "delete" });
      return;
    }
    void executeBulkAction();
  };

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("settingsAdmin.deactivateDialog.title", { key: confirm.setting.key })
        : t("settingsAdmin.actions.deleteConfirm", { key: confirm.setting.key })
      : confirm
        ? t(`settingsAdmin.bulk.confirm.${confirm.action}`)
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("settingsAdmin.deactivateDialog.description")
        : t("settingsAdmin.bulk.confirmDescription")
      : confirm
        ? t("settingsAdmin.bulk.confirmDescription")
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
    deleteSetting,
    confirmTitle,
    confirmDescription,
    bulkResult,
    setBulkResult,
    executeBulkAction,
    runBulkAction,
    bulkDangerous: bulkAction === "delete",
  };
}