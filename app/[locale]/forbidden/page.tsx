import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShieldX } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forbidden" });

  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function ForbiddenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forbidden" });

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md bg-surface-secondary rounded-panel shadow-elevation-3 border border-border-primary p-8 sm:p-10 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-card bg-accent-subtle text-copper flex items-center justify-center">
          <ShieldX className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} aria-hidden="true" />
        </div>
        <p className="text-[clamp(3rem,8vw,4rem)] font-bold text-accent mb-2">403</p>
        <h1 className="text-heading-3 font-bold text-accent mb-3">{t("title")}</h1>
        <p className="text-content-secondary text-body-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {t("description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-11 px-8 py-3 bg-accent text-content-contrast rounded-pill text-body-sm uppercase tracking-wider hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 transition-all duration-200 font-medium"
          >
            {t("backToDashboard")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-11 px-8 py-3 border border-border-interactive text-accent rounded-pill text-body-sm uppercase tracking-wider hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 transition-all duration-200 font-medium"
          >
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
