"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListUsersResult } from "@/lib/users/service";
import type { UsersActionsState } from "./use-users-actions";
import { useUsersActions } from "./use-users-actions";
import type { UsersBulkState } from "./use-users-bulk";
import { useUsersBulk } from "./use-users-bulk";
import type { UsersListState } from "./use-users-list";
import { useUsersList } from "./use-users-list";

type UsersContextValue = UsersListState & UsersActionsState & UsersBulkState;

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: ListUsersResult;
  children: React.ReactNode;
}) {
  const list = useUsersList(user, initialData);
  const actions = useUsersActions(list);
  const bulk = useUsersBulk(list, actions);

  return (
    <UsersContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
