"use client";

import type { BulkResult } from "@/components/admin-list/types";
import { useAdminResourceBulk } from "@/components/admin-list/use-admin-resource-bulk";
import type { RulesActionsState } from "./use-rules-actions";
import type { RulesListState } from "./use-rules-list";

export type { BulkResult } from "@/components/admin-list/types";

export interface RulesBulkState {
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  bulkDangerous: boolean;
}

export function useRulesBulk(
  list: RulesListState,
  actions: RulesActionsState,
): RulesBulkState {
  return useAdminResourceBulk(
    {
      namespace: "dashboardRules",
      isDangerous: (action) => action === "delete",
      makeConfirm: (action) => ({ kind: "bulk", action }),
      execute: async ({ action, scope, ids, filters }) => {
        const response = await fetch("/api/v1/rules/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action,
            scope,
            ids: scope === "page" ? ids : undefined,
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
