"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListCareGuidesResult } from "@/lib/services/care-guides-types";
import type { CareGuidesActionsState } from "./use-care-guides-actions";
import { useCareGuidesActions } from "./use-care-guides-actions";
import type { CareGuidesBulkState } from "./use-care-guides-bulk";
import { useCareGuidesBulk } from "./use-care-guides-bulk";
import type { CareGuidesListState } from "./use-care-guides-list";
import { useCareGuidesList } from "./use-care-guides-list";

type CareGuidesContextValue = CareGuidesListState &
  CareGuidesActionsState &
  CareGuidesBulkState;

const CareGuidesContext = createContext<CareGuidesContextValue | null>(null);

export function CareGuidesProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: ListCareGuidesResult;
  children: React.ReactNode;
}) {
  const list = useCareGuidesList(user, initialData);
  const actions = useCareGuidesActions(list);
  const bulk = useCareGuidesBulk(list, actions);

  return (
    <CareGuidesContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </CareGuidesContext.Provider>
  );
}

export function useCareGuides(): CareGuidesContextValue {
  const context = useContext(CareGuidesContext);
  if (!context) {
    throw new Error("useCareGuides must be used within a CareGuidesProvider");
  }
  return context;
}
