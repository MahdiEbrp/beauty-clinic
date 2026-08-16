"use client";

import { createContext, useContext } from "react";

import type { AuthUser } from "@/lib/auth/dal";

import { useRulesActions } from "./use-rules-actions";
import type { RulesActionsState } from "./use-rules-actions";
import { useRulesBulk } from "./use-rules-bulk";
import type { RulesBulkState } from "./use-rules-bulk";
import { useRulesList } from "./use-rules-list";
import type { RulesListState, RulesResult } from "./use-rules-list";

export type RulesContextValue = RulesListState &
  RulesActionsState &
  RulesBulkState;

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: RulesResult;
  children: React.ReactNode;
}) {
  const list = useRulesList(user, initialData);
  const actions = useRulesActions(list);
  const bulk = useRulesBulk(list, actions);
  return (
    <RulesContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </RulesContext.Provider>
  );
}

export function useRules(): RulesContextValue {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
}
