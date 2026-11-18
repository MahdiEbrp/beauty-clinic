"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { asTranslate } from "@/src/i18n/message-key";
import type { BulkResult } from "./types";

export interface BulkListState<S extends string, A extends string> {
  load: (params: { search: string; status: S; page: number; groupId?: string; from?: string; to?: string }) => Promise<void>;
  debouncedSearch: string;
  status: S;
  page: number;
  visibleIds: string[];
  selectedIds: string[];
  selectionScope: "page" | "filtered";
  clearSelection: () => void;
  bulkAction: A;
  filterValues: { groupId?: string; from?: string; to?: string };
}

export interface BulkActionsState<C> {
  setBusyId: (value: string | null) => void;
  setConfirm: (value: C | null) => void;
  setSyncing: (id: string, syncing: boolean) => void;
}

interface AdminBulkExecutionConfig<A extends string, C, S extends string> {
  namespace: string;
  isAvailable?: (action: A) => boolean;
  isDangerous: (action: A) => boolean;
  makeConfirm: (action: A) => C;
  execute: (input: {
    action: A;
    scope: "page" | "filtered";
    ids: string[];
    filters: { search: string; status: S; groupId?: string; from?: string; to?: string };
  }) => Promise<BulkResult>;
}

export interface AdminBulkExecutionState {
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  bulkDangerous: boolean;
}

export function useAdminBulkExecution<
  S extends string,
  A extends string,
  C,
>(
  config: AdminBulkExecutionConfig<A, C, S>,
  list: BulkListState<S, A>,
  actions: BulkActionsState<C>,
): AdminBulkExecutionState {
  const t = asTranslate(useTranslations());
  const {
    load, debouncedSearch, status, page, visibleIds, selectedIds,
    selectionScope, clearSelection, bulkAction, filterValues,
  } = list;
  const { setBusyId, setConfirm, setSyncing } = actions;
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const targetIds = selectionScope === "page" ? selectedIds : visibleIds;

  const executeBulkAction = async () => {
    if (config.isAvailable && !config.isAvailable(bulkAction)) return;
    if (selectionScope === "page" && selectedIds.length === 0) return;
    setConfirm(null);
    setBusyId("bulk");
    const pendingToast = toast.loading(t(`${config.namespace}.toast.syncing`));
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const result = await config.execute({
        action: bulkAction,
        scope: selectionScope,
        ids: targetIds,
        filters: { search: debouncedSearch, status, ...filterValues },
      });
      setBulkResult(result.failures.length > 0 ? result : null);
      clearSelection();
      await load({ search: debouncedSearch, status, page, ...filterValues });
      toast.success(t(`${config.namespace}.toast.success`), { id: pendingToast });
    } catch {
      toast.error(t(`${config.namespace}.toast.error`), { id: pendingToast });
    } finally {
      targetIds.forEach((id) => setSyncing(id, false));
      setBusyId(null);
    }
  };

  const runBulkAction = () => {
    if (selectionScope === "page" && selectedIds.length === 0) return;
    if (config.isAvailable && !config.isAvailable(bulkAction)) return;
    if (config.isDangerous(bulkAction)) {
      setConfirm(config.makeConfirm(bulkAction));
      return;
    }
    void executeBulkAction();
  };

  return {
    bulkResult,
    setBulkResult,
    executeBulkAction,
    runBulkAction,
    bulkDangerous:
      (!config.isAvailable || config.isAvailable(bulkAction)) &&
      config.isDangerous(bulkAction),
  };
}
