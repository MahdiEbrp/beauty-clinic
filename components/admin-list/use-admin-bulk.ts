"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminListConfig, BulkResult } from "./types";
import type { AdminActionsState } from "./use-admin-actions";
import type { AdminListState } from "./use-admin-list";

export interface AdminBulkState {
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  bulkDangerous: boolean;
}

export function useAdminBulk<T extends { id: string }>(
  config: AdminListConfig<T>,
  list: AdminListState<T>,
  actions: AdminActionsState<T>,
): AdminBulkState {
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
  const { setBusyId, setConfirm, setSyncing } = actions;
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

  const refresh = () => load({ search: debouncedSearch, status, page });

  const executeBulkAction = async () => {
    if (!selectedIds.length && selectionScope === "page") return;
    setConfirm(null);
    setBusyId("bulk");
    const pendingToast = toast.loading(t(`${config.namespace}.toast.syncing`));
    const targetIds = selectionScope === "page" ? selectedIds : visibleIds;
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const result = await config.executeBulk(bulkAction, targetIds, {
        search: debouncedSearch,
        status,
      });
      setBulkResult(
        result.failures.length > 0 ? result : null,
      );
      clearSelection();
      await refresh();
      toast.success(t(`${config.namespace}.toast.success`), { id: pendingToast });
    } catch {
      toast.error(t(`${config.namespace}.toast.error`), { id: pendingToast });
    } finally {
      targetIds.forEach((id) => setSyncing(id, false));
      setBusyId(null);
    }
  };

  const runBulkAction = () => {
    const action = config.bulkActions.find((a) => a.key === bulkAction);
    if (!action) return;
    if (action.dangerous) {
      setConfirm({ kind: "bulk", action: bulkAction });
      return;
    }
    void executeBulkAction();
  };

  const bulkDangerous =
    !!config.bulkActions.find((a) => a.key === bulkAction)?.dangerous;

  return {
    bulkResult,
    setBulkResult,
    executeBulkAction,
    runBulkAction,
    bulkDangerous,
  };
}
