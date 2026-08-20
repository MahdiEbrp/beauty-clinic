"use client";

import { useTranslations } from "next-intl";
import { Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "./settings-context";
import { SettingValue, StatusBadge, TypeBadge, RowActions } from "./table";
import { SelectionCheckbox } from "@/components/services/helpers";

export function MobileCards() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed, debouncedSearch, status, selectedIds, toggleSettingSelection } = useSettings();
  if (hasLoadFailed) {
    return <div className="py-10 text-center text-dash-body text-content-secondary">{t("settingsAdmin.errorTitle")}</div>;
  }
  if (isLoading) {
    return (
      <div className="space-y-3 p-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-card border border-border-primary bg-surface-secondary p-3">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-surface-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 animate-pulse rounded-control bg-surface-tertiary" />
              <div className="h-2.5 w-1/3 animate-pulse rounded-control bg-surface-tertiary/70" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <SettingsIcon className="h-8 w-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-3 text-dash-body text-content-secondary">
          {debouncedSearch || status !== "all" ? t("settingsAdmin.emptySearch") : t("settingsAdmin.empty")}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3 p-3 md:hidden">
      {data.items.map((setting) => {
        const isSelected = selectedIds.includes(setting.id);
        return (
          <article key={setting.id} className={`flex items-start gap-3 rounded-card border border-border-primary bg-surface-secondary p-3.5 ${isSelected ? "bg-accent-subtle/40" : ""}`}>
            <div className="pt-0.5">
              <SelectionCheckbox checked={isSelected} onChange={() => toggleSettingSelection(setting.id)} label={t("settingsAdmin.selectRow")} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 dir="ltr" className="truncate text-dash-body font-semibold text-accent">{setting.key}</h3>
                <StatusBadge setting={setting} />
              </div>
              <div className="mt-1.5"><SettingValue setting={setting} /></div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TypeBadge type={setting.type} />
                <span className="text-dash-caption text-content-tertiary">{t("settingsAdmin.orderLabel", { order: setting.displayOrder })}</span>
              </div>
            </div>
            <div className="shrink-0"><RowActions row={setting} /></div>
          </article>
        );
      })}
    </div>
  );
}