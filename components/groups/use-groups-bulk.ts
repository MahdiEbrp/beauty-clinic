"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { GroupsActionsState } from "./use-groups-actions";
import type { GroupsListState } from "./use-groups-list";

export interface BulkResult {
  requested: number;
  succeeded: number;
  failures: Array<{ id: string; code: string }>;
}

export interface GroupsBulkState {
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  bulkDangerous: boolean;
}

export function useGroupsBulk(
  list: GroupsListState,
  actions: GroupsActionsState,
): GroupsBulkState {
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
    const pendingToast = toast.loading(t("serviceGroups.toast.syncing"));
    const targetIds = selectionScope === "page" ? selectedIds : visibleIds;
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const response = await fetch("/api/v1/service-groups/bulk", {
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
      setBulkResult(
        payload.data.failures.length > 0 ? payload.data : null,
      );
      clearSelection();
      await refresh();
      toast.success(t("serviceGroups.toast.success"), { id: pendingToast });
    } catch {
      toast.error(t("serviceGroups.toast.error"), { id: pendingToast });
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

  const bulkDangerous = bulkAction === "delete";

  return {
    bulkResult,
    setBulkResult,
    executeBulkAction,
    runBulkAction,
    bulkDangerous,
  };
}
