"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AdminRule } from "@/lib/services/rules-types";

import type { DestructiveConfirm } from "./types";
import type { RulesListState } from "./use-rules-list";

export interface RulesActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (target: AdminRule, patch: { isActive?: boolean }) => Promise<void>;
  deleteRule: (row: AdminRule) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useRulesActions(list: RulesListState): RulesActionsState {
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

  const runAction = async (target: AdminRule, patch: { isActive?: boolean }) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("dashboardRules.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/rules/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("action_failed");
      await refresh();
      toast.success(t("dashboardRules.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("dashboardRules.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteRule = async (row: AdminRule) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("dashboardRules.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/rules/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      await refresh();
      toast.success(t("dashboardRules.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("dashboardRules.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const ruleName = (rule: AdminRule) =>
    rule.translations.fa.name || rule.translations.en.name || rule.slug;

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("dashboardRules.deactivateDialog.title", { name: ruleName(confirm.rule) })
        : t("dashboardRules.actions.deleteConfirm", { name: ruleName(confirm.rule) })
      : confirm
        ? t(`dashboardRules.bulk.confirm.${confirm.action}`)
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("dashboardRules.deactivateDialog.description")
        : t("dashboardRules.bulk.confirmDescription")
      : confirm
        ? t("dashboardRules.bulk.confirmDescription")
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
    deleteRule,
    confirmTitle,
    confirmDescription,
  };
}
