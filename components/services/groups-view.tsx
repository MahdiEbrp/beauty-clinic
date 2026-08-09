"use client";

import { useTranslations } from "next-intl";
import { Layers, Pencil, Trash2 } from "lucide-react";
import { useServices } from "./services-context";
import { GroupRowSkeleton } from "./skeletons";

export function GroupsView() {
  const t = useTranslations();
  const {
    summary,
    summaryLoading,
    canWrite,
    canManage,
    openEditGroup,
    requestDelete,
  } = useServices();
  return (
    <section
      id="services-panel-groups"
      role="tabpanel"
      aria-labelledby="services-tab-groups"
      className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
    >
      <div className="flex min-h-11 items-center justify-between border-b border-border-primary bg-surface-tertiary/30 px-4 py-2.5 md:px-6">
        <p className="text-dash-caption text-content-tertiary">
          {t("servicesCatalog.groupsCount", {
            count: summary.groups.length,
          })}
        </p>
      </div>
      <ul className="divide-y divide-border-primary">
        {summaryLoading &&
          summary.groups.length === 0 &&
          [0, 1, 2].map((index) => (
            <li key={index} className="px-4 md:px-6">
              <GroupRowSkeleton />
            </li>
          ))}
        {summary.groups.map((group) => (
          <li
            key={group.id}
            className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-surface-primary/60 md:px-6"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
              aria-hidden="true"
            >
              <Layers className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-dash-body font-semibold text-accent">
                {group.name}
              </p>
              <p className="truncate text-dash-caption text-content-tertiary" dir="ltr">
                {group.slug}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${
                group.isActive
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-surface-tertiary text-content-secondary border-border-primary"
              }`}
            >
              {t(
                `servicesCatalog.statuses.${group.isActive ? "active" : "inactive"}`,
              )}
            </span>
            <span className="hidden shrink-0 text-dash-caption text-content-tertiary sm:inline">
              {t("servicesCatalog.groupsCategories", {
                count: group.categoryCount,
              })}
            </span>
            {(canWrite || canManage) && (
              <div className="flex shrink-0 items-center gap-1">
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => openEditGroup(group)}
                    aria-label={t("servicesCatalog.actions.edit")}
                    className="inline-flex size-9 items-center justify-center rounded-pill text-accent transition hover:bg-surface-tertiary"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                )}
                {canManage && (
                  <button
                    type="button"
                    onClick={() =>
                      requestDelete({ kind: "group", item: group })
                    }
                    aria-label={t("servicesCatalog.actions.delete")}
                    className="inline-flex size-9 items-center justify-center rounded-pill text-error transition hover:bg-error/10"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {summary.groups.length === 0 && !summaryLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-16 h-16 bg-surface-tertiary rounded-control flex items-center justify-center mb-6">
            <Layers
              className="w-8 h-8 text-content-tertiary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <p className="text-content-secondary text-dash-body">
            {t("servicesCatalog.groupsEmpty")}
          </p>
        </div>
      )}
    </section>
  );
}
