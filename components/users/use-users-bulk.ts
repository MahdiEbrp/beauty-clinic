"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { UsersActionsState } from "./use-users-actions";
import type { UsersListState } from "./use-users-list";

export interface BulkResult {
  temporaryPasswords: Array<{ id: string; password: string }>;
  failures: Array<{ id: string; code: string }>;
}

export interface UsersBulkState {
  bulkResult: BulkResult | null;
  setBulkResult: (value: BulkResult | null) => void;
  executeBulkAction: () => Promise<void>;
  runBulkAction: () => void;
  copyTemporaryPasswords: () => Promise<void>;
  downloadTemporaryPasswords: () => void;
  confirmTitle: string;
  confirmDescription: string;
  bulkDangerous: boolean;
}

export function useUsersBulk(
  list: UsersListState,
  actions: UsersActionsState,
): UsersBulkState {
  const t = useTranslations();
  const {
    load,
    debouncedSearch,
    status,
    role,
    page,
    visibleIds,
    selectedIds,
    selectionScope,
    clearSelection,
    bulkAction,
    bulkRole,
  } = list;
  const { setBusyId, setConfirm, setSyncing, confirm } = actions;

  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

  const refresh = () => load({ search: debouncedSearch, status, role, page });

  const executeBulkAction = async () => {
    if (!selectedIds.length && selectionScope === "page") return;
    if (bulkAction === "change-role" && !bulkRole) return;
    setConfirm(null);
    setBusyId("bulk");
    const pendingToast = toast.loading(t("users.toast.syncing"));
    const targetIds = selectionScope === "page" ? selectedIds : visibleIds;
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const response = await fetch("/api/v1/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: bulkAction,
          scope: selectionScope,
          ids: selectionScope === "page" ? selectedIds : undefined,
          filters:
            selectionScope === "filtered"
              ? { search: debouncedSearch, status, role }
              : undefined,
          roleKey: bulkAction === "change-role" ? bulkRole : undefined,
        }),
      });
      if (!response.ok) throw new Error("bulk_failed");
      const payload = (await response.json()) as { data: BulkResult };
      setBulkResult(
        payload.data.temporaryPasswords.length || payload.data.failures.length
          ? payload.data
          : null,
      );
      clearSelection();
      await refresh();
      toast.success(t("users.toast.bulkSuccess"), { id: pendingToast });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      targetIds.forEach((id) => setSyncing(id, false));
      setBusyId(null);
    }
  };

  const runBulkAction = () => {
    if (["ban", "delete", "reset-password"].includes(bulkAction)) {
      setConfirm({ kind: "bulk", action: bulkAction });
      return;
    }
    void executeBulkAction();
  };

  const temporaryPasswordText =
    bulkResult?.temporaryPasswords
      .map((item) => `${item.id}\t${item.password}`)
      .join("\n") ?? "";
  const copyTemporaryPasswords = async () => {
    await navigator.clipboard.writeText(temporaryPasswordText);
  };
  const downloadTemporaryPasswords = () => {
    const blob = new Blob([temporaryPasswordText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "temporary-passwords.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const confirmTitle =
    confirm?.kind === "row"
      ? confirm.action === "ban"
        ? t("users.banDialog.title", { name: confirm.user.fullName })
        : confirm.action === "deactivate"
          ? t("users.deactivateDialog.title", { name: confirm.user.fullName })
          : t("users.actions.deleteConfirm", { name: confirm.user.fullName })
      : confirm
        ? t(`users.bulk.confirm.${confirm.action}`)
        : "";
  const confirmDescription =
    confirm?.kind === "row"
      ? confirm.action === "ban"
        ? t("users.banDialog.description")
        : confirm.action === "deactivate"
          ? t("users.deactivateDialog.description")
          : t("users.bulk.confirmDescription")
      : confirm
        ? t("users.bulk.confirmDescription")
        : "";
  const bulkDangerous = ["ban", "delete", "reset-password"].includes(
    bulkAction,
  );

  return {
    bulkResult,
    setBulkResult,
    executeBulkAction,
    runBulkAction,
    copyTemporaryPasswords,
    downloadTemporaryPasswords,
    confirmTitle,
    confirmDescription,
    bulkDangerous,
  };
}
