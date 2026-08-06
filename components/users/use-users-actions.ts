"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AdminUser } from "@/lib/users/service";
import type { DestructiveConfirm } from "./types";
import type { UsersListState } from "./use-users-list";

export interface UsersActionsState {
  busyId: string | null;
  setBusyId: (value: string | null) => void;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  confirm: DestructiveConfirm | null;
  setConfirm: (value: DestructiveConfirm | null) => void;
  banReason: string;
  setBanReason: (value: string) => void;
  addOpen: boolean;
  setAddOpen: (value: boolean) => void;
  addError: string | null;
  setAddError: (value: string | null) => void;
  runAction: (
    target: AdminUser,
    patch: {
      isActive?: boolean;
      isBanned?: boolean;
      banReason?: string | null;
    },
  ) => Promise<void>;
  deleteUser: (row: AdminUser) => Promise<void>;
  saveRole: (target: AdminUser, nextRole: string) => Promise<void>;
  createUser: (values: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    roleKey: string;
  }) => Promise<void>;
  changePassword: (userId: string, password: string) => Promise<void>;
  setPasswordTarget: (value: AdminUser | null) => void;
  passwordTarget: AdminUser | null;
  setRoleTarget: (value: AdminUser | null) => void;
  roleTarget: AdminUser | null;
  roleValue: string;
  setRoleValue: (value: string) => void;
}

export function useUsersActions(list: UsersListState): UsersActionsState {
  const t = useTranslations();
  const { load, setPage, debouncedSearch, status, role, page } = list;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<DestructiveConfirm | null>(null);
  const [banReason, setBanReason] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [roleValue, setRoleValue] = useState("");

  const setSyncing = (id: string, syncing: boolean) => {
    setSyncingIds((current) => {
      const next = new Set(current);
      if (syncing) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const isSyncing = (id: string) => syncingIds.has(id);

  const refresh = () => load({ search: debouncedSearch, status, role, page });

  const runAction = async (
    target: AdminUser,
    patch: {
      isActive?: boolean;
      isBanned?: boolean;
      banReason?: string | null;
    },
  ) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/users/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const code = payload?.error?.code as string | undefined;
        if (code === "SELF_LOCKOUT") throw new Error("self_lockout");
        throw new Error("action_failed");
      }
      setBanReason("");
      await refresh();
      toast.success(t("users.toast.success"), { id: pendingToast });
    } catch (error) {
      toast.error(
        t(
          error instanceof Error && error.message === "self_lockout"
            ? "users.errors.selfLockout"
            : "users.toast.error",
        ),
        { id: pendingToast },
      );
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteUser = async (row: AdminUser) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/users/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      await refresh();
      toast.success(t("users.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const saveRole = async (target: AdminUser, nextRole: string) => {
    setRoleTarget(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/users/${target.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roleKey: nextRole }),
      });
      if (!response.ok) throw new Error("role_failed");
      await refresh();
      toast.success(t("users.toast.roleSuccess"), { id: pendingToast });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const createUser = async (values: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    roleKey: string;
  }) => {
    setAddError(null);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...values, phone: values.phone.trim() }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { code?: string };
        } | null;
        throw new Error(
          payload?.error?.code === "EMAIL_TAKEN"
            ? "email_taken"
            : "create_failed",
        );
      }
      await load({ search: debouncedSearch, status, role, page: 1 });
      setPage(1);
      toast.success(t("users.toast.userCreated"), { id: pendingToast });
    } catch (error) {
      setAddError(
        t(
          error instanceof Error && error.message === "email_taken"
            ? "users.form.errors.emailTaken"
            : "users.errors.create",
        ),
      );
      toast.error(t("users.toast.error"), { id: pendingToast });
      throw error;
    }
  };

  const changePassword = async (userId: string, password: string) => {
    setPasswordTarget(null);
    setBusyId(userId);
    setSyncing(userId, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/users/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, confirmPassword: password }),
      });
      if (!response.ok) throw new Error("password_failed");
      await refresh();
      toast.success(t("users.toast.passwordSuccess"), {
        id: pendingToast,
      });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(userId, false);
      setBusyId(null);
    }
  };

  return {
    busyId,
    setBusyId,
    syncingIds,
    isSyncing,
    setSyncing,
    confirm,
    setConfirm,
    banReason,
    setBanReason,
    addOpen,
    setAddOpen,
    addError,
    setAddError,
    runAction,
    deleteUser,
    saveRole,
    createUser,
    changePassword,
    setPasswordTarget,
    passwordTarget,
    setRoleTarget,
    roleTarget,
    roleValue,
    setRoleValue,
  };
}
