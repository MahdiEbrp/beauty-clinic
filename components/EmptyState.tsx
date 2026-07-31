"use client";

import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";

export default function EmptyState() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-surface-tertiary rounded-control flex items-center justify-center mb-6">
        <Inbox
          className="w-8 h-8 text-content-tertiary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <p className="text-content-secondary text-lg">
        {t("common.empty")}
      </p>
    </div>
  );
}
