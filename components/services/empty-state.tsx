"use client";

import { useTranslations } from "next-intl";
import { SearchX, Sparkles } from "lucide-react";
import { useServices } from "./services-context";

export function ServicesEmptyState() {
  const t = useTranslations();
  const { data, debouncedSearch, status, featured, categoryId } = useServices();

  if (data.items.length > 0) return null;

  const filtering = Boolean(
    debouncedSearch ||
      status !== "all" ||
      featured !== "all" ||
      Boolean(categoryId),
  );

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
          <Sparkles
            className="w-8 h-8 text-content-tertiary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </div>
      <p className="text-content-secondary text-dash-body">
        {filtering ? t("servicesCatalog.emptySearch") : t("servicesCatalog.empty")}
      </p>
    </div>
  );
}
