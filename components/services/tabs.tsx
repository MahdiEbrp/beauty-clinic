"use client";

import { useTranslations } from "next-intl";
import { Layers, FolderTree, LayoutList } from "lucide-react";
import type { TabKey } from "./types";
import { useServices } from "./services-context";

const TABS: Array<{ key: TabKey; icon: React.ElementType; labelKey: string }> = [
  { key: "services", icon: LayoutList, labelKey: "tabs.services" },
  { key: "groups", icon: Layers, labelKey: "tabs.groups" },
  { key: "categories", icon: FolderTree, labelKey: "tabs.categories" },
];

export function ServicesTabs() {
  const t = useTranslations();
  const { tab, setTab, summary } = useServices();

  const counts: Record<TabKey, number> = {
    services: summary.totalServices,
    groups: summary.groups.length,
    categories: summary.categories.length,
  };

  return (
    <div
      role="tablist"
      aria-label={t("servicesCatalog.tabs.label")}
      className="flex items-center gap-1 overflow-x-auto rounded-panel border border-border-primary bg-surface-secondary p-1 shadow-elevation-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((item) => {
        const Icon = item.icon;
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`services-panel-${item.key}`}
            id={`services-tab-${item.key}`}
            onClick={() => setTab(item.key)}
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-pill px-4 text-dash-body-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active
                ? "bg-accent text-content-contrast shadow-elevation-1"
                : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
            <span
              className={`rounded-pill px-2 py-0.5 text-dash-caption font-bold ${
                active
                  ? "bg-content-contrast/20 text-content-contrast"
                  : "bg-surface-tertiary text-content-tertiary"
              }`}
              aria-hidden="true"
            >
              {counts[item.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
