"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListServiceGroupsResult } from "@/lib/services/types";
import type { GroupsActionsState } from "./use-groups-actions";
import { useGroupsActions } from "./use-groups-actions";
import type { GroupsBulkState } from "./use-groups-bulk";
import { useGroupsBulk } from "./use-groups-bulk";
import type { GroupsListState } from "./use-groups-list";
import { useGroupsList } from "./use-groups-list";

type GroupsContextValue = GroupsListState & GroupsActionsState & GroupsBulkState;

const GroupsContext = createContext<GroupsContextValue | null>(null);

export function GroupsProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: ListServiceGroupsResult;
  children: React.ReactNode;
}) {
  const list = useGroupsList(user, initialData);
  const actions = useGroupsActions(list);
  const bulk = useGroupsBulk(list, actions);

  return (
    <GroupsContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups(): GroupsContextValue {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error("useGroups must be used within a GroupsProvider");
  }
  return context;
}
