"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type {
  AdminCollectionRow,
  LandingListResult,
} from "@/lib/landing/admin/types";
import type { LandingActionsState } from "./use-landing-actions";
import { useLandingActions } from "./use-landing-actions";
import type { LandingBulkState } from "./use-landing-bulk";
import { useLandingBulk } from "./use-landing-bulk";
import type { LandingListState } from "./use-landing-list";
import { useLandingList } from "./use-landing-list";
import type { CollectionKey } from "./types";

type LandingCollectionContextValue = LandingListState &
  LandingActionsState &
  LandingBulkState;

const LandingCollectionContext =
  createContext<LandingCollectionContextValue | null>(null);

export function LandingCollectionProvider({
  collection,
  user,
  initialData,
  children,
}: {
  collection: CollectionKey;
  user: AuthUser;
  initialData: LandingListResult<AdminCollectionRow>;
  children: React.ReactNode;
}) {
  const list = useLandingList(collection, user, initialData);
  const actions = useLandingActions(list);
  const bulk = useLandingBulk(list, actions);

  return (
    <LandingCollectionContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </LandingCollectionContext.Provider>
  );
}

export function useLandingCollection(): LandingCollectionContextValue {
  const context = useContext(LandingCollectionContext);
  if (!context) {
    throw new Error(
      "useLandingCollection must be used within a LandingCollectionProvider",
    );
  }
  return context;
}
