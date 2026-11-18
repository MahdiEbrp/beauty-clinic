"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import { runAdminRowAction } from "@/components/shared/run-admin-row-action";

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
  const execute = (
    target: T & { id: string },
    operation: () => Promise<void>,
    successKey: "success" | "deleted",
  ) =>
    runAdminRowAction({
      id: target.id,
      syncingMessage: t(`${config.namespace}.toast.syncing`),
      successMessage: t(`${config.namespace}.toast.${successKey}`),
      errorMessage: t(`${config.namespace}.toast.error`),
      operation,
      refresh,
      setBusyId,
      setSyncing,
      clearConfirm: () => setConfirm(null),
    });

  const runAction = (target: T & { id: string }, patch: P) =>
    execute(target, () => config.patchRow(target, patch), "success");

  const deleteRow = (row: T & { id: string }) =>
    execute(row, () => config.deleteRow(row), "deleted");

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
