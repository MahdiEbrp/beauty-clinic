"use client";

import { useTranslations } from "next-intl";
import { SearchX, Stethoscope } from "lucide-react";
import { useServices } from "./services-context";

export function ServicesEmptyState() {
  const t = useTranslations();
  const { data, debouncedSearch, status, featured } = useServices();
  if (data.items.length > 0) return null;
  const filtering = Boolean(debouncedSearch || status !== "all" || featured !== "all");
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-control bg-surface-tertiary">
        {filtering ? (
          <SearchX className="h-8 w-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Stethoscope className="h-8 w-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <p className="text-content-secondary text-dash-body">
        {filtering ? t("serviceServices.emptySearch") : t("serviceServices.empty")}
      </p>
    </div>
  );
}
