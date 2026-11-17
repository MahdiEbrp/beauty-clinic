"use client";

import { useTranslations } from "next-intl";
import type { AdminServiceGroup } from "@/lib/services/types";
import { useAdminResourceActions } from "@/components/admin-list/use-admin-resource-actions";
import type { DestructiveConfirm } from "./types";
import type { GroupsListState } from "./use-groups-list";

export interface GroupsActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (target: AdminServiceGroup, patch: { isActive?: boolean }) => Promise<void>;
  deleteGroup: (row: AdminServiceGroup) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
}

export function useGroupsActions(list: GroupsListState): GroupsActionsState {
  const t = useTranslations();
  const actions = useAdminResourceActions<
    AdminServiceGroup,
    { isActive?: boolean },
    DestructiveConfirm
  >(
    {
      namespace: "serviceGroups",
      patchRow: async (row, patch) => {
        const response = await fetch(`/api/v1/service-groups/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patch),
        });
        if (!response.ok) throw new Error("action_failed");
      },
      deleteRow: async (row) => {
        const response = await fetch(`/api/v1/service-groups/${row.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error("delete_failed");
      },
    },
    list,
  );

  const confirmTitle =
    actions.confirm?.kind === "row"
      ? actions.confirm.action === "deactivate"
        ? t("serviceGroups.deactivateDialog.title", { name: actions.confirm.group.name })
        : t("serviceGroups.actions.deleteConfirm", { name: actions.confirm.group.name })
      : actions.confirm
        ? t(`serviceGroups.bulk.confirm.${actions.confirm.action}`)
        : "";
  const confirmDescription =
    actions.confirm?.kind === "row"
      ? actions.confirm.action === "deactivate"
        ? t("serviceGroups.deactivateDialog.description")
        : t("serviceGroups.bulk.confirmDescription")
      : actions.confirm
        ? t("serviceGroups.bulk.confirmDescription")
        : "";

  return {
    ...actions,
    deleteGroup: actions.deleteRow,
    confirmTitle,
    confirmDescription,
  };
}
