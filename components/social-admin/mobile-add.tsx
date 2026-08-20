"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Plus } from "lucide-react";
import { useSocialLinks } from "./social-context";

export function MobileAdd() {
  const t = useTranslations();
  const { canWrite } = useSocialLinks();
  if (!canWrite) return null;
  return (
    <Link
      href="/dashboard/settings/social/add"
      className="fixed inset-x-4 bottom-20 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-3 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
    >
      <Plus className="size-5" aria-hidden="true" />
      {t("socialAdmin.add")}
    </Link>
  );
}