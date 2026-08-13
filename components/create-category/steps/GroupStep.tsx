"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, FolderTree, LayoutGrid } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

import type { FieldErrors, GroupOption } from "../types";
import { Panel } from "../../create-group/ui";

export default function GroupStep({
  groupOptions,
  selectedGroupId,
  onSelect,
  errors,
}: {
  groupOptions: GroupOption[];
  selectedGroupId: string;
  onSelect: (groupId: string) => void;
  errors: FieldErrors;
}) {
  const t = useTranslations("categoryWizard");

  return (
    <Panel>
      <div className="grid gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
              {t("group.title")}
              <span className="ms-1 text-copper" aria-hidden="true">
                *
              </span>
            </h3>
            <p className="mt-1 max-w-xl text-dash-body-sm text-content-secondary">
              {t("group.hint")}
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-2 rounded-pill bg-copper/10 px-3 py-1.5 text-dash-caption font-bold text-copper-strong sm:inline-flex">
            <FolderTree className="size-4" aria-hidden="true" />
            {t("group.badge")}
          </span>
        </div>

        {errors.groupId && (
          <p role="alert" className="text-dash-caption font-medium text-error">
            {errors.groupId}
          </p>
        )}

        {groupOptions.length === 0 ? (
          <div
            role="status"
            className="flex flex-col items-start gap-3 rounded-control border border-warning/30 bg-warning/10 p-4 text-dash-body-sm text-warning"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-bold">{t("group.emptyTitle")}</p>
                <p className="text-warning/90">{t("group.emptyDescription")}</p>
              </div>
            </div>
            <Link
              href="/dashboard/services/manage/groups/add"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary"
            >
              {t("group.createGroup")}
            </Link>
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label={t("group.title")}
            className="grid max-h-80 gap-2 overflow-y-auto pe-1 sm:grid-cols-2"
          >
            {groupOptions.map((option) => {
              const isSelected = option.id === selectedGroupId;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelect(option.id)}
                  className={`flex min-h-14 items-center gap-3 rounded-control border p-3.5 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isSelected
                      ? "border-copper bg-copper/10 text-accent"
                      : "border-border-primary bg-surface-primary text-content-secondary hover:border-border-interactive hover:bg-surface-tertiary/50"
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-pill border ${
                      isSelected
                        ? "border-copper bg-copper"
                        : "border-border-interactive"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="size-2 rounded-pill bg-content-contrast" />
                    )}
                  </span>
                  <LayoutGrid
                    className="size-4 shrink-0 text-copper-strong"
                    aria-hidden="true"
                  />
                  <span className="truncate text-dash-body-sm font-semibold">
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
