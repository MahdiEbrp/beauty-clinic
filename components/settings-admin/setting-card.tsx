"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import type { AdminSetting } from "@/lib/settings/admin";
import type { MessageKey } from "@/src/i18n/message-key";
import { previewValue } from "./helpers";
import { RowActions, StatusBadge, TypeBadge } from "./primitives";

/** Translated label for a setting key, falling back to the raw key. */
export function SettingKeyLabel({ setting }: { setting: AdminSetting }) {
  const t = useTranslations();
  const key = `settingsAdmin.keys.${setting.key}` as MessageKey;
  return t.has(key) ? t(key) : setting.key;
}

export function SettingCard({ setting }: { setting: AdminSetting }) {
  const t = useTranslations();
  const locale = useLocale() === "fa" ? "fa" : "en";
  const value = previewValue(setting, locale);
  const isLocalized = setting.type === "localized";
  return (
    <article className="rounded-card border border-border-primary bg-surface-primary p-3.5 shadow-elevation-1 transition-colors hover:border-copper">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-dash-body font-bold text-content-primary">
            <SettingKeyLabel setting={setting} />
          </h3>
          <p dir="ltr" className="mt-1 truncate text-dash-caption text-content-tertiary">
            {setting.key}
          </p>
        </div>
        <div className="shrink-0">
          <RowActions row={setting} />
        </div>
      </div>
      <div className="mt-2.5 space-y-2">
        <p
          dir={isLocalized ? (locale === "fa" ? "rtl" : "ltr") : "ltr"}
          className="wrap-break-word text-start text-dash-body-sm text-content-secondary"
        >
          {value}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <TypeBadge type={setting.type} />
          {isLocalized && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-copper/40 bg-surface-tertiary px-2 py-0.5 text-dash-caption font-bold text-copper-strong">
              <Languages className="size-3" aria-hidden="true" />
              {t("settingsAdmin.localized")}
            </span>
          )}
          <StatusBadge setting={setting} />
        </div>
      </div>
    </article>
  );
}