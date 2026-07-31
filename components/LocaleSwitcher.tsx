"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { Globe } from "lucide-react";
import { routing } from "@/src/i18n/routing";
import { localeMeta, isLocaleMetaKey } from "@/data/locales";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const target = routing.locales.find((l) => l !== locale) ?? locale;

  // Name of the target language rendered in the current language, so the label
  // stays in one script instead of the previous mixed "Switch to فارسی".
  const targetName =
    new Intl.DisplayNames([locale], { type: "language" }).of(target) ?? target;

  const handleSwitch = () => {
    // `usePathname` drops the fragment, so a user reading #contact would be
    // thrown back to the top of the page on switch. Re-attach it.
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    router.replace(`${pathname}${hash}`, { locale: target });
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-11 bg-transparent border border-border-interactive text-accent rounded-pill transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent text-sm font-semibold"
      aria-label={t("localeSwitcher.switchTo", { language: targetName })}
    >
      <Globe className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
      {/* The chip reads in the target language, so it carries its own lang. */}
      <span lang={target}>
        {isLocaleMetaKey(target) ? localeMeta[target].short : target}
      </span>
    </button>
  );
}
