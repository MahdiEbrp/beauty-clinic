"use client";

import { useTranslations } from "next-intl";
import type { AdminRule } from "@/lib/services/rules-types";
import { useAdminResourceActions } from "@/components/admin-list/use-admin-resource-actions";

import type { DestructiveConfirm, RuleStatusFilter } from "./types";
import type { RulesListState } from "./use-rules-list";

export interface RulesActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (target: AdminRule, patch: { isActive?: boolean }) => Promise<void>;
  deleteRule: (row: AdminRule) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useRulesActions(list: RulesListState): RulesActionsState {
  const t = useTranslations();
  const actions = useAdminResourceActions<
    AdminRule,
    { isActive?: boolean },
    DestructiveConfirm,
    RuleStatusFilter
  >(
    {
      namespace: "dashboardRules",
      patchRow: async (row, patch) => {
        const response = await fetch(`/api/v1/rules/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patch),
        });
        if (!response.ok) throw new Error("action_failed");
      },
      deleteRow: async (row) => {
        const response = await fetch(`/api/v1/rules/${row.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error("delete_failed");
      },
    },
    list,
  );

  const ruleName = (rule: AdminRule) =>
    rule.translations.fa.name || rule.translations.en.name || rule.slug;

  const confirmTitle =
    actions.confirm?.kind === "row"
      ? actions.confirm.action === "deactivate"
        ? t("dashboardRules.deactivateDialog.title", { name: ruleName(actions.confirm.rule) })
        : t("dashboardRules.actions.deleteConfirm", { name: ruleName(actions.confirm.rule) })
      : actions.confirm
        ? t(`dashboardRules.bulk.confirm.${actions.confirm.action}`)
        : "";
  const confirmDescription =
    actions.confirm?.kind === "row"
      ? actions.confirm.action === "deactivate"
        ? t("dashboardRules.deactivateDialog.description")
        : t("dashboardRules.bulk.confirmDescription")
      : actions.confirm
        ? t("dashboardRules.bulk.confirmDescription")
        : "";

  return {
    ...actions,
    deleteRule: actions.deleteRow,
    confirmTitle,
    confirmDescription,
  };
}
