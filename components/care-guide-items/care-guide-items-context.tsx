"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListCareGuideItemsResult } from "@/lib/services/care-guides-types";
import type { CareGuideItemsActionsState } from "./use-care-guide-items-actions";
import { useCareGuideItemsActions } from "./use-care-guide-items-actions";
import type { CareGuideItemsBulkState } from "./use-care-guide-items-bulk";
import { useCareGuideItemsBulk } from "./use-care-guide-items-bulk";
import type { CareGuideItemsListState } from "./use-care-guide-items-list";
import { useCareGuideItemsList } from "./use-care-guide-items-list";

type CareGuideItemsContextValue = CareGuideItemsListState &
  CareGuideItemsActionsState &
  CareGuideItemsBulkState & {
    guideOptions: Array<{ id: string; name: string }>;
  };

const CareGuideItemsContext = createContext<CareGuideItemsContextValue | null>(null);

export function CareGuideItemsProvider({
  user,
  initialData,
  guideOptions = [],
  options,
  children,
}: {
  user: AuthUser;
  initialData: ListCareGuideItemsResult;
  guideOptions?: Array<{ id: string; name: string }>;
  options?: { guideId?: string };
  children: React.ReactNode;
}) {
  const list = useCareGuideItemsList(user, initialData, options);
  const actions = useCareGuideItemsActions(list);
  const bulk = useCareGuideItemsBulk(list, actions);

  const value: CareGuideItemsContextValue = { ...list, ...actions, ...bulk, guideOptions };

  return (
    <CareGuideItemsContext.Provider value={value}>
      {children}
    </CareGuideItemsContext.Provider>
  );
}

export function useCareGuideItems(): CareGuideItemsContextValue {
  const context = useContext(CareGuideItemsContext);
  if (!context) {
    throw new Error(
      "useCareGuideItems must be used within a CareGuideItemsProvider",
    );
  }
  return context;
}
