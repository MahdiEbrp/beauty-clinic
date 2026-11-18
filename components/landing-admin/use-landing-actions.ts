"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { msgKey } from "@/src/i18n/message-key";
import type { DestructiveConfirm } from "./types";
import type { LandingListState } from "./use-landing-list";
import { editPathFor, endpointFor, rowTitle } from "./config";
import { runAdminRowAction } from "@/components/shared/run-admin-row-action";

export interface LandingActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  runAction: (id: string, patch: { isActive?: boolean }) => Promise<void>;
  deleteRow: (id: string) => Promise<void>;
  editPath: (id: string) => string;
  confirmTitle: string;
  confirmDescription: string;
}

export function useLandingActions(list: LandingListState): LandingActionsState {
  const t = useTranslations();
  const { collection, data, load, debouncedSearch, status, page } = list;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<DestructiveConfirm | null>(null);

  const setSyncing = (id: string, syncing: boolean) => {
    setSyncingIds((current) => {
      const next = new Set(current);
      if (syncing) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const isSyncing = (id: string) => syncingIds.has(id);

  const refresh = () => load({ search: debouncedSearch, status, page });
  const execute = (
    id: string,
    request: () => Promise<void>,
    successKey: "success" | "deleted",
  ) =>
    runAdminRowAction({
      id,
      syncingMessage: t("landingAdmin.toast.syncing"),
      successMessage: t(`landingAdmin.toast.${successKey}`),
      errorMessage: t("landingAdmin.toast.error"),
      operation: request,
      refresh,
      setBusyId,
      setSyncing,
      clearConfirm: () => setConfirm(null),
    });

  const runAction = (id: string, patch: { isActive?: boolean }) =>
    execute(
      id,
      async () => {
        const response = await fetch(`${endpointFor(collection)}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patch),
        });
        if (!response.ok) throw new Error("action_failed");
      },
      "success",
    );

  const deleteRow = (id: string) =>
    execute(
      id,
      async () => {
        const response = await fetch(`${endpointFor(collection)}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error("delete_failed");
      },
      "deleted",
    );

  const editPath = (id: string) => editPathFor(collection, id);

  const confirmRow =
    confirm?.kind === "row"
      ? data.items.find((item) => item.id === confirm.rowId)
      : undefined;
  const confirmName = confirmRow ? rowTitle(confirmRow) : "";

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("landingAdmin.deactivateDialog.title", { name: confirmName })
        : t("landingAdmin.actions.deleteConfirm", { name: confirmName })
      : confirm
        ? t(msgKey(`landingAdmin.bulk.confirm.${confirm.action}`))
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "deactivate"
        ? t("landingAdmin.deactivateDialog.description")
        : t("landingAdmin.bulk.confirmDescription")
      : confirm
        ? t("landingAdmin.bulk.confirmDescription")
        : "";

  return {
    busyId,
    setBusyId,
    syncingIds,
    isSyncing,
    setSyncing,
    confirm,
    setConfirm,
    runAction,
    deleteRow,
    editPath,
    confirmTitle,
    confirmDescription,
  };
}
