"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Construction,
  LayoutGrid,
  Network,
  Plus,
  Stethoscope,
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export type ManageEntity = "groups" | "categories" | "services";

function ManageEntityIcon({ entity }: { entity: ManageEntity }) {
  switch (entity) {
    case "groups":
      return <Network className="size-8" aria-hidden="true" />;
    case "categories":
      return <LayoutGrid className="size-8" aria-hidden="true" />;
    case "services":
      return <Stethoscope className="size-8" aria-hidden="true" />;
  }
}

export default function ServiceManagePlaceholder({
  entity,
}: {
  entity: ManageEntity;
}) {
  const t = useTranslations();
  const name = t(`servicesManage.names.${entity}`);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-panel border border-border-primary bg-surface-secondary p-8 text-center shadow-elevation-2 sm:p-10">
        <div className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong">
          <ManageEntityIcon entity={entity} />
          <span className="absolute -bottom-1 -inset-e-1 flex size-7 items-center justify-center rounded-pill bg-accent text-on-primary shadow-elevation-2">
            <Construction className="size-4" aria-hidden="true" />
          </span>
        </div>
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          {t("servicesManage.heading", { name })}
        </h1>
        <p className="mt-3 text-dash-body-sm text-content-secondary">
          {t("servicesManage.description", { name })}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {entity === "groups" && (
            <Link
              href="/dashboard/services/manage/groups/add"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{t("servicesManage.addNew")}</span>
            </Link>
          )}
          <Link
            href="/dashboard/services"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-5 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
            <span>{t("servicesManage.back")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}