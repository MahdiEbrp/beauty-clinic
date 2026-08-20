"use client";

import { useTranslations } from "next-intl";
import { useSocialLinks } from "./social-context";
import { LinkGlyph, StatusBadge, RowActions } from "./table";
import { SelectionCheckbox } from "@/components/services/helpers";

export function MobileCards() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed, debouncedSearch, status, selectedIds, toggleLinkSelection } = useSocialLinks();
  if (hasLoadFailed) return <div className="py-10 text-center text-dash-body text-content-secondary">{t("socialAdmin.errorTitle")}</div>;
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
        <p className="text-dash-body text-content-secondary">
          {debouncedSearch || status !== "all" ? t("socialAdmin.emptySearch") : t("socialAdmin.empty")}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3 p-3 md:hidden">
      {data.items.map((link) => {
        const isSelected = selectedIds.includes(link.id);
        return (
          <article key={link.id} className={`flex items-start gap-3 rounded-card border border-border-primary bg-surface-secondary p-3.5 ${isSelected ? "bg-accent-subtle/40" : ""}`}>
            <div className="pt-0.5">
              <SelectionCheckbox checked={isSelected} onChange={() => toggleLinkSelection(link.id)} label={t("socialAdmin.selectRow")} />
            </div>
            <LinkGlyph link={link} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-dash-body font-semibold text-accent">{link.labelFa}</h3>
                <StatusBadge link={link} />
              </div>
              <p dir="ltr" className="mt-0.5 truncate text-dash-caption text-content-tertiary">{link.url}</p>
              <p className="mt-1 text-dash-caption text-content-secondary">{t("socialAdmin.orderLabel", { order: link.displayOrder })}</p>
            </div>
            <div className="shrink-0"><RowActions row={link} /></div>
          </article>
        );
      })}
    </div>
  );
}