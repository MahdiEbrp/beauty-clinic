"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, LayoutGrid, Layers } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

import type { CategoryOption, FieldErrors } from "../types";

export default function CategoryStep({
  categoryOptions,
  selectedCategoryId,
  onSelect,
  errors,
}: {
  categoryOptions: CategoryOption[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  errors: FieldErrors;
}) {
  const t = useTranslations("serviceWizard");

  const groups = new Map<string, CategoryOption[]>();
  for (const option of categoryOptions) {
    const key = option.groupName || t("category.unnamedGroup");
    const arr = groups.get(key) ?? [];
    arr.push(option);
    groups.set(key, arr);
  }
  const groupKeys = Array.from(groups.keys());

  return (
    <div className="space-y-6">
      {errors.categoryId && (
        <p role="alert" className="text-dash-caption font-medium text-error">
          {errors.categoryId}
        </p>
      )}

      {categoryOptions.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-start gap-3 rounded-control border border-warning/30 bg-warning/10 p-4 text-dash-body-sm text-warning"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="space-y-0.5">
              <p className="font-bold">{t("category.emptyTitle")}</p>
              <p className="text-warning/90">{t("category.emptyDescription")}</p>
            </div>
          </div>
          <Link
            href="/dashboard/services/manage/categories/add"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("category.createCategory")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {groupKeys.map((groupName) => {
            const options = groups.get(groupName) ?? [];
            return (
              <fieldset key={groupName} className="space-y-2">
                <legend className="flex items-center gap-2 text-dash-caption font-bold text-content-secondary">
                  <Layers className="size-4 text-copper-strong" aria-hidden="true" />
                  <span>{groupName}</span>
                </legend>
                <div
                  role="radiogroup"
                  aria-label={t("category.title")}
                  className="grid gap-2"
                >
                  {options.map((option) => {
                    const isSelected = option.id === selectedCategoryId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onSelect(option.id)}
                        className={`flex min-h-12 items-center gap-3 rounded-control border p-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          isSelected
                            ? "border-accent bg-accent-subtle/60 text-accent"
                            : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive hover:bg-surface-tertiary/50"
                        }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-pill border ${
                            isSelected
                              ? "border-accent bg-accent text-content-contrast"
                              : "border-border-interactive"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <span className="size-2 rounded-pill bg-current" />
                          )}
                        </span>
                        <LayoutGrid className="size-4 shrink-0 text-copper-strong" aria-hidden="true" />
                        <span className="min-w-0 truncate text-dash-body font-semibold">
                          {option.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      )}
    </div>
  );
}
