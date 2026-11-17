"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { asTranslate } from "@/src/i18n/message-key";
import type { BulkResult } from "./types";

interface BulkListState<S extends string, A extends string> {
  load: (params: { search: string; status: S; page: number }) => Promise<void>;
  debouncedSearch: string;
  status: S;
  page: number;
  visibleIds: string[];
  selectedIds: string[];
  selectionScope: "page" | "filtered";
  clearSelection: () => void;
  bulkAction: A;
}

interface BulkActionsState<C> {
  setBusyId: (value: string | null) => void;
  setConfirm: (value: C | null) => void;
  setSyncing: (id: string, syncing: boolean) => void;
}

interface AdminResourceBulkConfig<A extends string, C, S extends string> {
  namespace: string;
  isDangerous: (action: A) => boolean;
  makeConfirm: (action: A) => C;
  execute: (input: {
    action: A;
    scope: "page" | "filtered";
    selectedIds: string[];
    filters: { search: string; status: S };
  }) => Promise<BulkResult>;
}

export interface AdminResourceBulkState {
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  bulkDangerous: boolean;
}

export function useAdminResourceBulk<
  S extends string,
  A extends string,
  C,
>(
  config: AdminResourceBulkConfig<A, C, S>,
  list: BulkListState<S, A>,
  actions: BulkActionsState<C>,
): AdminResourceBulkState {
  const t = asTranslate(useTranslations());
  const {
    load, debouncedSearch, status, page, visibleIds, selectedIds,
    selectionScope, clearSelection, bulkAction,
  } = list;
  const { setBusyId, setConfirm, setSyncing } = actions;
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const targetIds = selectionScope === "page" ? selectedIds : visibleIds;

  const executeBulkAction = async () => {
    if (!selectedIds.length && selectionScope === "page") return;
    setConfirm(null);
    setBusyId("bulk");
    const pendingToast = toast.loading(t(`${config.namespace}.toast.syncing`));
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const result = await config.execute({
        action: bulkAction,
        scope: selectionScope,
        selectedIds,
        filters: { search: debouncedSearch, status },
      });
      setBulkResult(result.failures.length > 0 ? result : null);
      clearSelection();
      await load({ search: debouncedSearch, status, page });
      toast.success(t(`${config.namespace}.toast.success`), { id: pendingToast });
    } catch {
      toast.error(t(`${config.namespace}.toast.error`), { id: pendingToast });
    } finally {
      targetIds.forEach((id) => setSyncing(id, false));
      setBusyId(null);
    }
  };

  const runBulkAction = () => {
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
    bulkDangerous: config.isDangerous(bulkAction),
  };
}
