"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListServicesResult, ServiceCatalogSummary } from "@/lib/services/types";
import type { ServicesActionsState } from "./use-services-actions";
import { useServicesActions } from "./use-services-actions";
import type { ServicesListState } from "./use-services-list";
import { useServicesList } from "./use-services-list";

type ServicesContextValue = ServicesListState & ServicesActionsState;

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({
  user,
  initialData,
  summary,
  children,
}: {
  user: AuthUser;
  initialData: ListServicesResult;
  summary: ServiceCatalogSummary;
  children: React.ReactNode;
}) {
  const list = useServicesList(user, initialData);
  const actions = useServicesActions(list, summary);

  return (
    <ServicesContext.Provider value={{ ...list, ...actions }}>
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
