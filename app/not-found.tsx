import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { routing } from "@/src/i18n/routing";
import { buildAlternates } from "@/lib/site";
import Link from "next/link";

/** Reached for paths outside any locale segment, so there is no request locale. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: buildAlternates(routing.defaultLocale, "/"),
};

/**
 * Root 404: reached for paths outside any locale segment, so there is no request
 * locale to read. Messages are loaded for the default locale instead of being
 * hardcoded bilingually in JSX (DESIGN_RULES #67).
 */
export default async function RootNotFound() {
  const t = await getTranslations({ locale: routing.defaultLocale });

  return (
    <div className="flex-1 flex items-center justify-center bg-surface-primary px-4 py-20">
      <div className="w-full max-w-md bg-surface-secondary rounded-panel shadow-elevation-3 border border-border-primary p-8 sm:p-10 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-card bg-accent-subtle text-accent flex items-center justify-center">
          <AlertTriangle
            className="w-8 h-8 sm:w-10 sm:h-10"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <p className="text-[clamp(3rem,8vw,4rem)] font-bold text-accent mb-2">
          404
        </p>
        <h1 className="text-heading-3 font-bold text-accent mb-3">
          {t("notFound.title")}
        </h1>
        <p className="text-content-secondary text-body-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {t("notFound.description")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-11 px-8 py-3 bg-accent text-content-contrast rounded-pill text-body-sm uppercase tracking-wider hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 transition-all duration-200 font-medium"
        >
          {t("notFound.goHome")}
        </Link>
      </div>
    </div>
  );
}
