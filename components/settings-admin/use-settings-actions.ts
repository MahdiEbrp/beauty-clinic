"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminSetting } from "@/lib/settings/admin";
import type { SettingsListState } from "./use-settings-list";

export type DestructiveConfirm = {
  action: "deactivate" | "delete";
  setting: AdminSetting;
};

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
}

export function useSettingsActions(list: SettingsListState): SettingsActionsState {
  const t = useTranslations();
  const { refresh } = list;
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

  const confirmTitle =
    confirm == null
      ? ""
      : confirm.action === "deactivate"
        ? t("settingsAdmin.deactivateDialog.title", { key: confirm.setting.key })
        : t("settingsAdmin.actions.deleteConfirm", { key: confirm.setting.key });
  const confirmDescription =
    confirm == null
      ? ""
      : confirm.action === "deactivate"
        ? t("settingsAdmin.deactivateDialog.description")
        : t("settingsAdmin.deleteDialog.description");

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
  };
}