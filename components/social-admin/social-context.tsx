"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { SocialLinksActionsState } from "./use-social-links-actions";
import type { SocialLinksListState } from "./use-social-links-list";
import { useSocialLinksList } from "./use-social-links-list";
import { useSocialLinksActions } from "./use-social-links-actions";

export type SocialLinksContextValue = SocialLinksListState & SocialLinksActionsState;

const SocialLinksContext = createContext<SocialLinksContextValue | null>(null);

export function SocialLinksProvider({
  user,
  initialData,
  children,
}: {
  user: AuthUser;
  initialData: SocialLinksListState["data"];
  children: React.ReactNode;
}) {
  const list = useSocialLinksList(user, initialData);
  const actions = useSocialLinksActions(list);
  return (
    <SocialLinksContext.Provider value={{ ...list, ...actions }}>
      {children}
    </SocialLinksContext.Provider>
  );
}

export function useSocialLinks(): SocialLinksContextValue {
  const context = useContext(SocialLinksContext);
  if (!context) {
    throw new Error("useSocialLinks must be used within a SocialLinksProvider");
  }
  return context;
}