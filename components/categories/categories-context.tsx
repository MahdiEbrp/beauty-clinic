"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListServiceCategoriesResult } from "@/lib/services/types";
import type { CategoriesActionsState } from "./use-categories-actions";
import { useCategoriesActions } from "./use-categories-actions";
import type { CategoriesBulkState } from "./use-categories-bulk";
import { useCategoriesBulk } from "./use-categories-bulk";
import type { CategoriesListState } from "./use-categories-list";
import { useCategoriesList } from "./use-categories-list";

type CategoriesContextValue = CategoriesListState &
  CategoriesActionsState &
  CategoriesBulkState;

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: ListServiceCategoriesResult;
  children: React.ReactNode;
}) {
  const list = useCategoriesList(user, initialData);
  const actions = useCategoriesActions(list);
  const bulk = useCategoriesBulk(list, actions);

  return (
    <CategoriesContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
