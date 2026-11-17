"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { asTranslate } from "@/src/i18n/message-key";

type RefreshableList<S extends string> = {
  load: (params: { search: string; status: S; page: number }) => Promise<void>;
  debouncedSearch: string;
  status: S;
  page: number;
};

interface AdminResourceActionsConfig<T, P> {
  namespace: string;
  patchRow: (row: T, patch: P) => Promise<void>;
  deleteRow: (row: T) => Promise<void>;
}

export interface AdminResourceActionsState<T, P, C> {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: C | null;
  setConfirm: (value: C | null) => void;
  runAction: (target: T & { id: string }, patch: P) => Promise<void>;
  deleteRow: (row: T & { id: string }) => Promise<void>;
}

export function useAdminResourceActions<
  T extends { id: string },
  P,
  C,
  S extends string,
>(
  config: AdminResourceActionsConfig<T, P>,
  list: RefreshableList<S>,
): AdminResourceActionsState<T, P, C> {
  const t = asTranslate(useTranslations());
  const { load, debouncedSearch, status, page } = list;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<C | null>(null);

  const setSyncing = (id: string, syncing: boolean) => {
    setSyncingIds((current) => {
      const next = new Set(current);
      if (syncing) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const refresh = () => load({ search: debouncedSearch, status, page });

  const runAction = async (target: T, patch: P) => {
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

  return {
    busyId,
    setBusyId,
    syncingIds,
    isSyncing: (id) => syncingIds.has(id),
    setSyncing,
    confirm,
    setConfirm,
    runAction,
    deleteRow,
  };
}
