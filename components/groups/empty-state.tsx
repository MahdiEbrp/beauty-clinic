"use client";

import { useTranslations } from "next-intl";
import { SearchX, Layers } from "lucide-react";
import { useGroups } from "./groups-context";

export function GroupsEmptyState() {
  const t = useTranslations();
  const { data, debouncedSearch, status } = useGroups();

  if (data.items.length > 0) return null;

  const filtering = Boolean(debouncedSearch || status !== "all");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 bg-surface-tertiary rounded-control flex items-center justify-center mb-6">
        {filtering ? (
          <SearchX
            className="w-8 h-8 text-content-tertiary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ) : (
          <Layers
            className="w-8 h-8 text-content-tertiary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </div>
      <p className="text-content-secondary text-dash-body">
        {filtering ? t("serviceGroups.emptySearch") : t("serviceGroups.empty")}
      </p>
    </div>
  );
}
