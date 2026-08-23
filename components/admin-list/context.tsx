"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { AdminListConfig, ListResult } from "./types";
import type { AdminActionsState } from "./use-admin-actions";
import type { AdminBulkState } from "./use-admin-bulk";
import type { AdminListState } from "./use-admin-list";
import { useAdminList } from "./use-admin-list";
import { useAdminActions } from "./use-admin-actions";
import { useAdminBulk } from "./use-admin-bulk";

export type AdminListContextValue<T extends { id: string }> = {
  config: AdminListConfig<T>;
} & AdminListState<T> &
  AdminActionsState<T> &
  AdminBulkState;

const AdminListContext = createContext<object | null>(null);

export function AdminListProvider<T extends { id: string }>({
  config,
  user,
  initialData,
  children,
}: {
  config: AdminListConfig<T>;
  user: AuthUser;
  initialData: ListResult<T>;
  children: React.ReactNode;
}) {
  const list = useAdminList<T>(config, user, initialData);
  const actions = useAdminActions<T>(config, list);
  const bulk = useAdminBulk<T>(config, list, actions);
  return (
    <AdminListContext.Provider value={{ config, ...list, ...actions, ...bulk }}>
      {children}
    </AdminListContext.Provider>
  );
}

export function useAdminListContext<T extends { id: string }>(): AdminListContextValue<T> {
  const context = useContext(AdminListContext);
  if (!context) {
    throw new Error(
      "useAdminListContext must be used within an AdminListProvider",
    );
  }
  return context as unknown as AdminListContextValue<T>;
}
