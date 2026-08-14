"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ServicesActionsState } from "./use-services-actions";
import type { ServicesBulkState } from "./use-services-bulk";
import type { ServicesListState, ServicesResult } from "./use-services-list";
import { useServicesList } from "./use-services-list";
import { useServicesActions } from "./use-services-actions";
import { useServicesBulk } from "./use-services-bulk";

export type ServicesContextValue = ServicesListState &
  ServicesActionsState &
  ServicesBulkState;

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: ServicesResult;
  children: React.ReactNode;
}) {
  const list = useServicesList(user, initialData);
  const actions = useServicesActions(list);
  const bulk = useServicesBulk(list, actions);
  return (
    <ServicesContext.Provider value={{ ...list, ...actions, ...bulk }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
}
