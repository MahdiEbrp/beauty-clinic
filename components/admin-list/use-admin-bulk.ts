"use client";

import type { AdminListConfig, BulkResult } from "./types";
import type { AdminActionsState } from "./use-admin-actions";
import type { AdminListState } from "./use-admin-list";
import { useAdminBulkExecution } from "./use-admin-bulk-execution";

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
  return useAdminBulkExecution(
    {
      namespace: config.namespace,
      isAvailable: (action) =>
        config.bulkActions.some((item) => item.key === action),
      isDangerous: (action) =>
        !!config.bulkActions.find((item) => item.key === action)?.dangerous,
      makeConfirm: (action) => ({ kind: "bulk" as const, action }),
      execute: ({ action, ids, filters, scope }) =>
        config.executeBulk(action, ids, filters, scope),
    },
    list,
    actions,
  );
}
