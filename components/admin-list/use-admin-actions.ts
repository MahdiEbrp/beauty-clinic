"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminListConfig, DestructiveConfirm } from "./types";
import type { AdminListState } from "./use-admin-list";

export interface AdminActionsState<T> {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm<T> | null;
  setConfirm: (value: DestructiveConfirm<T> | null) => void;
  runAction: (target: T, patch: Record<string, unknown>) => Promise<void>;
  deleteRow: (row: T) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useAdminActions<T extends { id: string }>(
  config: AdminListConfig<T>,
  list: AdminListState<T>,
): AdminActionsState<T> {
  const t = useTranslations();
  const { load, debouncedSearch, status, page } = list;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<DestructiveConfirm<T> | null>(null);

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

  const runAction = async (target: T, patch: Record<string, unknown>) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t(`${config.namespace}.toast.syncing`));
    try {
      await config.patchRow(target, patch);
      await refresh();
      toast.success(t(`${config.namespace}.toast.success`), { id: pendingToast });
    } catch {
      toast.error(t(`${config.namespace}.toast.error`), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteRow = async (row: T) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t(`${config.namespace}.toast.syncing`));
    try {
      await config.deleteRow(row);
      await refresh();
      toast.success(t(`${config.namespace}.toast.deleted`), { id: pendingToast });
    } catch {
      toast.error(t(`${config.namespace}.toast.error`), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

    const matchedBulk = confirm
    ? config.bulkActions.find((a) => a.key === confirm.action) ?? null
    : null;
  const bulkActionLabel = matchedBulk ? t(matchedBulk.labelKey) : "";

  const confirmTitle =
    confirm?.kind === "row" && confirm.row
      ? config.confirmPhrase(confirm.action, confirm.row).title
      : confirm
        ? t(`${config.namespace}.bulk.confirmTitle`, { action: bulkActionLabel })
        : "";
  const confirmDescription =
    confirm?.kind === "row" && confirm.row
      ? config.confirmPhrase(confirm.action, confirm.row).description
      : confirm
        ? t(`${config.namespace}.bulk.confirmDescription`)
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
    deleteRow,
    confirmTitle,
    confirmDescription,
  };
}
