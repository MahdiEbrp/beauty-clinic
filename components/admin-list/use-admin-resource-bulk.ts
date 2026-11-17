"use client";

import type { BulkResult } from "./types";
import type { AdminBulkExecutionState } from "./use-admin-bulk-execution";
import { useAdminBulkExecution } from "./use-admin-bulk-execution";

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
    ids: string[];
    filters: { search: string; status: S };
  }) => Promise<BulkResult>;
}

export type AdminResourceBulkState = AdminBulkExecutionState;

export function useAdminResourceBulk<
  S extends string,
  A extends string,
  C,
>(
  config: AdminResourceBulkConfig<A, C, S>,
  list: BulkListState<S, A>,
  actions: BulkActionsState<C>,
): AdminResourceBulkState {
  return useAdminBulkExecution(
    {
      namespace: config.namespace,
      isDangerous: config.isDangerous,
      makeConfirm: config.makeConfirm,
      execute: config.execute,
    },
    list,
    actions,
  );
}
