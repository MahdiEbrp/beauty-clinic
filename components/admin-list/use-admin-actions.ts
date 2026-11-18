"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import type { AdminListConfig, DestructiveConfirm } from "./types";
import type { AdminListState } from "./use-admin-list";
import { runAdminRowAction } from "@/components/shared/run-admin-row-action";

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
  const t = asTranslate(useTranslations());
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
  const execute = (
    target: T,
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

  const runAction = (target: T, patch: Record<string, unknown>) =>
    execute(target, () => config.patchRow(target, patch), "success");

  const deleteRow = (row: T) =>
    execute(row, () => config.deleteRow(row), "deleted");

  const matchedBulk = confirm
    ? config.bulkActions.find((action) => action.key === confirm.action) ?? null
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
