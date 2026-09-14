"use client";

import { useTranslations } from "next-intl";
import { Check, Layers, ListOrdered, Plus, ShieldCheck, X } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import type { GroupTheme } from "../group-theme";
import type { SelectedGroup } from "../types";

type GroupDetailModalProps = {
  group: SelectedGroup;
  theme: GroupTheme;
  selected: boolean;
  onToggle: () => void;
  onClose: () => void;
};

/** Treatment-group "more info" dialog: description + category/service breakdown. */
export function GroupDetailModal({
  group,
  theme,
  selected,
  onToggle,
  onClose,
}: GroupDetailModalProps) {
  const t = useTranslations("booking");
  const GroupIcon = theme.icon;

  const categoryCount = group.categories.length;
  const serviceCount = group.categories.reduce(
    (sum, category) => sum + category.services.length,
    0,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={group.title}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-elevation-4 animate-zoom-in">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-primary bg-accent p-3.5 text-content-contrast">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-control",
                theme.iconBg,
                theme.iconColor,
              )}
            >
              <GroupIcon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-caption text-content-contrast/80">
                {t("groups.categoryCount", { n: formatNumber(categoryCount) })}
              </span>
              <h3 className="truncate text-body font-black leading-snug">{group.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("groupDetail.close")}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-control text-content-contrast/80 transition-colors hover:bg-surface-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 rounded-control border border-border-primary bg-surface-secondary p-3">
            <span className="inline-flex items-center gap-1.5 text-body-sm font-bold text-content-secondary">
              <Layers className="size-4 shrink-0 text-copper" aria-hidden="true" />
              {t("groups.categoryCount", { n: formatNumber(categoryCount) })}
            </span>
            <span className="inline-flex items-center gap-1.5 text-body-sm font-bold text-content-secondary">
              <ListOrdered className="size-4 shrink-0 text-copper" aria-hidden="true" />
              {t("groups.serviceCount", { n: formatNumber(serviceCount) })}
            </span>
          </div>

          <div className="space-y-1.5 rounded-control border border-border-primary/80 bg-surface-secondary/50 p-3.5">
            <span className="block text-body-sm font-black text-copper-deep">
              {t("groupDetail.about")}
            </span>
            <p className="text-body-sm leading-relaxed text-content-secondary">
              {group.description || t("groupDetail.noDescription")}
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="block text-body-sm font-black text-copper-deep">
              {t("groupDetail.categoriesLabel")}
            </span>
            <ul className="space-y-2.5">
              {group.categories.map((category) => (
                <li
                  key={category.slug}
                  className="rounded-control border border-border-primary/80 bg-surface-secondary/50 p-3"
                >
                  <p className="text-body-sm font-bold text-content-primary">{category.title}</p>
                  {category.description ? (
                    <p className="mt-0.5 text-caption leading-relaxed text-content-tertiary">
                      {category.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category.services.map((service) => (
                      <span
                        key={service.id}
                        className={cn(
                          "inline-flex max-w-full items-center rounded-pill border px-2 py-0.5 text-caption font-bold",
                          theme.tagBarBg,
                          theme.tagBarText,
                          theme.tagBarBorder,
                        )}
                      >
                        <span className="truncate">{service.title}</span>
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-control border border-accent/20 bg-accent/5 p-3 text-caption leading-relaxed text-content-secondary">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-copper" aria-hidden="true" />
            <div>
              <span className="block text-body-sm font-bold text-accent">
                {t("groupDetail.safetyTitle")}
              </span>
              <span>{t("groupDetail.safetyDesc")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2.5 border-t border-border-primary bg-surface-secondary p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-control border border-border-interactive px-4 text-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            {t("groupDetail.close")}
          </button>

          <button
            type="button"
            onClick={() => {
              onToggle();
              onClose();
            }}
            className={cn(
              "inline-flex min-h-12 w-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-control px-4 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto",
              selected ? "bg-copper hover:bg-copper-deep" : "bg-accent hover:bg-accent-hover",
            )}
          >
            {selected ? (
              <>
                <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                <span>{t("groupDetail.removeGroup")}</span>
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden="true" />
                <span>{t("groupDetail.selectGroup")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
