"use client";

import type { BulkResult } from "@/components/admin-list/types";
import { useAdminResourceBulk } from "@/components/admin-list/use-admin-resource-bulk";
import type { GroupsActionsState } from "./use-groups-actions";
import type { GroupsListState } from "./use-groups-list";

export type { BulkResult } from "@/components/admin-list/types";

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
  return useAdminResourceBulk(
    {
      namespace: "serviceGroups",
      isDangerous: (action) => action === "delete",
      makeConfirm: (action) => ({ kind: "bulk", action }),
      execute: async ({ action, scope, selectedIds, filters }) => {
        const response = await fetch("/api/v1/service-groups/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action,
            scope,
            ids: scope === "page" ? selectedIds : undefined,
            filters: scope === "filtered" ? filters : undefined,
          }),
        });
        if (!response.ok) throw new Error("bulk_failed");
        const payload = (await response.json()) as { data: BulkResult };
        return payload.data;
      },
    },
    list,
    actions,
  );
}
