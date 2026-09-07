"use client";

import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import { Plus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useAdminListContext } from "./context";

export function AdminListEmptyState<T extends { id: string }>() {
  const t = asTranslate(useTranslations());
  const ctx = useAdminListContext<T>();
  const { config, hasLoadFailed, data, isLoading, search } = ctx;
  if (isLoading) return null;

  const titleKey =
    hasLoadFailed && Boolean(search)
      ? `${config.namespace}.errorTitle`
      : data.total === 0
        ? `${config.namespace}.empty`
        : `${config.namespace}.emptySearch`;

  return (
    <div className="px-6 py-12 text-center">
      <p className="text-dash-body-sm font-bold text-content-secondary">{t(titleKey)}</p>
      {data.total === 0 && !search && !hasLoadFailed && config.addHref && (
        <Link
          href={config.addHref}
          className="mt-2 inline-flex items-center gap-2 rounded-pill bg-accent px-4 py-2 text-dash-body-sm font-bold text-content-contrast transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t(`${config.namespace}.add`)}
        </Link>
      )}
    </div>
  );
}
