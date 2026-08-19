"use client";

import { useTranslations } from "next-intl";
import { ImageIcon } from "lucide-react";
import type { Locale } from "@/lib/services/types";
import { inputClass, Field, Panel } from "@/components/create-group/ui";
import GroupGlyph from "@/components/create-group/GroupGlyph";

export function LangBadge({ lang }: { lang: Locale }) {
  const t = useTranslations("landingForm");
  return (
    <span className="rounded-pill bg-copper/10 px-2.5 py-1 text-dash-caption font-bold text-copper-strong">
      {t("language.editing", { lang: t(`language.${lang}`) })}
    </span>
  );
}

export function OrderActivePanel({
  displayOrder,
  onDisplayOrderChange,
  isActive,
  onToggleActive,
}: {
  displayOrder: string;
  onDisplayOrderChange: (value: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="grid gap-6">
        <Field
          id="landing-order"
          label={t("fields.displayOrder")}
          hint={t("fields.displayOrderHint")}
        >
          <input
            id="landing-order"
            dir="ltr"
            inputMode="numeric"
            value={displayOrder}
            onChange={(event) =>
              onDisplayOrderChange(event.target.value.replace(/[^0-9]/g, ""))
            }
            className={inputClass(false)}
          />
        </Field>
        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("fields.active")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("fields.activeHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={t("fields.active")}
            onClick={onToggleActive}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? "bg-accent" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                isActive ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export function IconField({
  iconKey,
  onOpenPicker,
}: {
  iconKey: string;
  onOpenPicker: () => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <p className="text-dash-body font-semibold text-content-primary">
            {t("fields.icon")}
          </p>
          <p className="text-dash-caption text-content-secondary">
            {t("fields.iconHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPicker}
          className="inline-flex min-h-11 items-center gap-3 rounded-control border border-border-interactive bg-surface-tertiary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-pill bg-surface-secondary text-accent">
            {iconKey ? (
              <GroupGlyph name={iconKey} className="size-4" />
            ) : (
              <ImageIcon className="size-4" aria-hidden="true" />
            )}
          </span>
          <span>{t("fields.iconChoose")}</span>
        </button>
      </div>
    </Panel>
  );
}

export function ImageUrlField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <Field
        id="landing-image"
        label={t("fields.imageUrl")}
        hint={t("fields.imageUrlHint")}
      >
        <input
          id="landing-image"
          dir="ltr"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className={inputClass(false)}
        />
      </Field>
      {value && (
        <div className="mt-4">
          <p className="mb-2 text-dash-caption font-bold text-content-secondary">
            {t("fields.preview")}
          </p>
          <div className="overflow-hidden rounded-card border border-border-primary bg-surface-tertiary/50">
            <img
              src={value}
              alt=""
              loading="lazy"
              className="h-40 w-full object-cover"
            />
          </div>
        </div>
      )}
    </Panel>
  );
}