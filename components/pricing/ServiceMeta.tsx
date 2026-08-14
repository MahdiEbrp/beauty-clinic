"use client";

import { useTranslations } from "next-intl";
import { Clock, Repeat } from "lucide-react";

type ServiceMetaProps = {
  durationMin: number | null;
  sessionsCount: number;
};

/** Duration + session count line shown on service cards and the detail panel. */
export default function ServiceMeta({ durationMin, sessionsCount }: ServiceMetaProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-body-sm text-content-tertiary">
      {durationMin ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          {durationMin} {t("serviceDetail.labels.minutes")}
        </span>
      ) : null}
      {sessionsCount > 0 ? (
        <span className="inline-flex items-center gap-1.5">
          <Repeat className="size-4" aria-hidden="true" />
          {t("serviceDetail.labels.sessionsCount", { count: sessionsCount })}
        </span>
      ) : null}
    </div>
  );
}