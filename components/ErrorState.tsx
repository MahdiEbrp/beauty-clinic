"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  onRetry?: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-error/10 rounded-control flex items-center justify-center mb-6">
        <AlertTriangle
          className="w-8 h-8 text-error"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <p className="text-content-secondary text-lg mb-4">
        {t("common.error")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-11 bg-accent text-content-contrast rounded-pill font-bold transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
        >
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}
