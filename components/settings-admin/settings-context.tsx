"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { SettingsActionsState } from "./use-settings-actions";
import type { SettingsListState } from "./use-settings-list";
import { useSettingsList } from "./use-settings-list";
import { useSettingsActions } from "./use-settings-actions";

export type SettingsContextValue = SettingsListState & SettingsActionsState;

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: SettingsListState["data"];
  children: React.ReactNode;
}) {
  const list = useSettingsList(user, initialData);
  const actions = useSettingsActions(list);
  return (
    <SettingsContext.Provider value={{ ...list, ...actions }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}