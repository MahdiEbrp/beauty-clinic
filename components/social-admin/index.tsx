"use client";

import { SocialLinksProvider } from "./social-context";
import type { AuthUser } from "@/lib/auth/dal";
import type { SocialLinksListState } from "./use-social-links-list";
import { SocialHeader } from "./header";
import { SocialFilters } from "./filters";
import { SelectionBar, SelectFilteredRow } from "./selection";
import { DesktopTable } from "./table";
import { MobileCards } from "./cards";
import { Pagination } from "./pagination";
import { MobileAdd } from "./mobile-add";
import { SocialLinksDialogs } from "./dialogs";

export function SocialLinksContent({ user, initialData }: { user: AuthUser; initialData: SocialLinksListState["data"] }) {
  return (
    <SocialLinksProvider user={user} initialData={initialData}>
      <SocialHeader />
      <div className="mt-4 space-y-4">
        <SocialFilters />
        <SelectFilteredRow />
        <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
          <SelectionBar />
          <DesktopTable />
          <MobileCards />
          <Pagination />
        </div>
      </div>
      <SocialLinksDialogs />
      <MobileAdd />
    </SocialLinksProvider>
  );
}