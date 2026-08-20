"use client";

import { SettingsProvider, useSettings } from "./settings-context";
import type { AuthUser } from "@/lib/auth/dal";
import type { SettingsListState } from "./use-settings-list";
import { SettingsHeader } from "./header";
import { SettingsFilters } from "./filters";
import { SelectionBar, SelectFilteredRow } from "./selection";
import { DesktopTable } from "./table";
import { MobileCards } from "./cards";
import { Pagination } from "./pagination";
import { MobileAdd } from "./mobile-add";
import { SettingsDialogs } from "./dialogs";

export function SettingsContent({ user, initialData }: { user: AuthUser; initialData: SettingsListState["data"] }) {
  return (
    <SettingsProvider user={user} initialData={initialData}>
      <SettingsHeader />
      <div className="mt-4 space-y-4">
        <SettingsFilters />
        <SelectFilteredRow />
        <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
          <SelectionBar />
          <DesktopTable />
          <MobileCards />
          <Pagination />
        </div>
      </div>
      <SettingsDialogs />
      <MobileAdd />
    </SettingsProvider>
  );
}