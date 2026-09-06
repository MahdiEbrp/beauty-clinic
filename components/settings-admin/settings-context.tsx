"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { AdminSetting } from "@/lib/settings/admin";
import { useSettingsActions, type SettingsActionsState } from "./use-settings-actions";
import { useSettingsList, type SettingsListState } from "./use-settings-list";

export type SettingsContextValue = SettingsListState & SettingsActionsState;

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  user,
  initialItems,
  children,
}: {
  user: AuthUser;
  initialItems: AdminSetting[];
  children: ReactNode;
}) {
  const list = useSettingsList(user, initialItems);
  const actions = useSettingsActions(list);
  return (
    <SettingsContext.Provider value={{ ...list, ...actions }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}