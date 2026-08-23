"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useAdminListContext } from "./context";

export function AdminListMobileAdd<T extends { id: string }>() {
  const t = useTranslations();
  const ctx = useAdminListContext<T>();
  const { config, canWrite } = ctx;
  if (!canWrite) return null;
  return (
    <Link
      href={config.addHref}
      className="fixed inset-x-4 bottom-20 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-3 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
    >
      <Plus className="size-5" aria-hidden="true" />
            {t(`${config.namespace}.add`)}
    </Link>
  );
}
