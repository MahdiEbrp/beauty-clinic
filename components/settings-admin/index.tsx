"use client";

import { SettingsProvider } from "./settings-context";
import type { AuthUser } from "@/lib/auth/dal";
import type { AdminSetting } from "@/lib/settings/admin";
import type { AdminSocialLink } from "@/lib/social/admin";
import { SettingsHeader } from "./header";
import { SettingsFilters } from "./filters";
import { SettingsAccordion } from "./settings-accordion";
import type { SettingGroupId } from "./grouping";
import { SettingsDialogs } from "./dialogs";

export function SettingsContent({
  user,
  initialItems,
  initialSocialLinks,
  initialOpenGroups,
}: {
  user: AuthUser;
  initialItems: AdminSetting[];
  initialSocialLinks: AdminSocialLink[];
  initialOpenGroups: SettingGroupId[];
}) {
  return (
    <SettingsProvider user={user} initialItems={initialItems}>
      <SettingsHeader />
      <div className="mt-4 space-y-4">
        <SettingsFilters />
        <SettingsAccordion
          initialOpenGroups={initialOpenGroups}
          initialSocialLinks={initialSocialLinks}
        />
      </div>
      <SettingsDialogs />
    </SettingsProvider>
  );
}