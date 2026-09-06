"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Accordion } from "radix-ui";
import { ChevronDown, Loader2, SearchX, Settings2 } from "lucide-react";
import type { MessageKey } from "@/src/i18n/message-key";
import type { AdminSetting } from "@/lib/settings/admin";
import type { AdminSocialLink } from "@/lib/social/admin";
import { GROUP_IDS, groupOfKey, SETTING_GROUPS, type SettingGroupId } from "./grouping";
import { SettingCard } from "./setting-card";
import { useSettings } from "./settings-context";
import { SocialSection } from "./social-section";

const STORAGE_KEY = "settings:open-groups";

function readPersisted(): SettingGroupId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((value): value is SettingGroupId =>
      (GROUP_IDS as readonly string[]).includes(value as string),
    );
  } catch {
    return [];
  }
}

export function SettingsAccordion({
  initialOpenGroups,
  initialSocialLinks,
}: {
  initialOpenGroups: SettingGroupId[];
  initialSocialLinks: AdminSocialLink[];
}) {
  const t = useTranslations();
  const { items, total, isLoading, hasLoadFailed, debouncedSearch, load, status } = useSettings();

  const [open, setOpen] = useState<SettingGroupId[]>(() => {
    const merged = Array.from(new Set([...readPersisted(), ...initialOpenGroups]));
    return merged.filter((id) => (GROUP_IDS as readonly string[]).includes(id));
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [open]);

  const grouped = useMemo(() => {
    const map = new Map<SettingGroupId, AdminSetting[]>();
    for (const group of SETTING_GROUPS) map.set(group.id, []);
    for (const item of items) map.get(groupOfKey(item.key))?.push(item);
    return map;
  }, [items]);

  const visibleGroups = SETTING_GROUPS.filter(
    (group) => group.id === "social" || (grouped.get(group.id)?.length ?? 0) > 0,
  );


  const retry = () => void load({ search: debouncedSearch, status });

  if (hasLoadFailed) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-error/30 bg-error/5 p-8 text-center">
        <Settings2 className="size-7 text-error" aria-hidden="true" />
        <div>
          <p className="text-dash-body font-bold text-error">{t("settingsAdmin.errorTitle")}</p>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("settingsAdmin.errorDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="inline-flex min-h-11 items-center justify-center rounded-pill border border-accent px-5 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("settingsAdmin.retry")}
        </button>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="grid gap-3" aria-live="polite">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex h-20 animate-pulse items-center justify-center rounded-card border border-border-primary bg-surface-secondary"
          >
            <Loader2 className="size-5 animate-spin text-content-tertiary" aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-primary bg-surface-secondary p-10 text-center">
        <SearchX className="size-8 text-content-tertiary" aria-hidden="true" />
        <p className="text-dash-body font-bold text-content-primary">{t("settingsAdmin.emptySearch")}</p>
        <p className="max-w-sm text-dash-caption text-content-secondary">{t("settingsAdmin.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* <nav aria-label={t("settingsAdmin.groupsLabel")} className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        {visibleGroups.map((group) => {
          const isOpen = open.includes(group.id);
          const Icon = group.icon;
          const count = grouped.get(group.id)?.length ?? 0;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => openAndScroll(group.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border px-4 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                isOpen
                  ? "border-copper bg-surface-secondary text-accent shadow-elevation-1"
                  : "border-border-primary text-content-secondary hover:border-border-interactive hover:text-accent",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{t(group.titleKey as MessageKey)}</span>
              {count > 0 && (
                <span className="rounded-pill bg-surface-tertiary px-2 py-0.5 text-dash-caption text-content-secondary">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav> */}

      <p className="px-0.5 text-dash-caption text-content-secondary">
        {t("settingsAdmin.resultsCount", { count: total })}
      </p>

      <Accordion.Root
        type="multiple"
        value={open}
        onValueChange={(next) => setOpen(next as SettingGroupId[])}
        className="space-y-3"
      >
        {visibleGroups.map((group) => {
          const Icon = group.icon;
          const count = grouped.get(group.id)?.length ?? 0;
          const groupItems = grouped.get(group.id) ?? [];
          return (
            <Accordion.Item
              key={group.id}
              value={group.id}
              id={`group-${group.id}`}
              className="scroll-mt-4 overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1"
            >
              <Accordion.Header className="flex">
                <Accordion.Trigger
                  className="group flex w-full items-center justify-between gap-4 px-4 py-4 text-start outline-none transition-colors hover:bg-surface-tertiary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-tertiary text-copper">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-dash-body font-bold text-content-primary">
                        {t(group.titleKey as MessageKey)}
                      </span>
                      <span className="block truncate text-dash-caption text-content-secondary">
                        {t(group.subtitleKey as MessageKey)}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    {count > 0 && (
                      <span className="rounded-pill border border-border-primary bg-surface-tertiary px-2.5 py-1 text-dash-caption font-bold text-content-secondary">
                        {count}
                      </span>
                    )}
                    <ChevronDown
                      className="size-5 text-content-tertiary transition-transform duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden text-start data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-4 pb-5 sm:px-5">
                  {groupItems.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {groupItems.map((setting) => (
                        <SettingCard key={setting.id} setting={setting} />
                      ))}
                    </div>
                  )}
                  {group.id === "social" && (
                    <SocialSection searchTerm={debouncedSearch} initialData={initialSocialLinks} />
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </div>
  );
}