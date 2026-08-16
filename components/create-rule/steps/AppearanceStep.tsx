"use client";

import { useTranslations } from "next-intl";
import { Check, Image as ImageIcon, RefreshCw } from "lucide-react";
import NextImage from "next/image";

import GroupGlyph from "@/components/create-group/GroupGlyph";
import {
  RULE_COLORS,
  ruleSwatchClass,
  ruleSwatchCheckClass,
} from "@/data/rule-colors";

import { Field, Panel, inputClass } from "../../create-group/ui";

export default function AppearanceStep({
  iconKey,
  onOpenIconPicker,
  color,
  onColorChange,
  imageUrl,
  onImageUrlChange,
  ns,
}: {
  iconKey: string;
  onOpenIconPicker: () => void;
  color: string;
  onColorChange: (value: string) => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  ns?: string;
}) {
  const t = useTranslations(ns ?? "rulesWizard");

  return (
    <Panel>
      <div className="grid gap-8 sm:gap-10">
        <section>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("appearance.icon")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("appearance.iconHint")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-primary text-copper sm:size-24">
              <GroupGlyph name={iconKey} className="size-10" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 space-y-2">
              <p
                className="truncate text-dash-body font-semibold text-content-primary"
                dir="ltr"
              >
                {iconKey}
              </p>
              <button
                type="button"
                onClick={onOpenIconPicker}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-primary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {t("appearance.change")}
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("appearance.color")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("appearance.colorHint")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {RULE_COLORS.map((option) => {
              const selected = option === color;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onColorChange(option)}
                  aria-pressed={selected}
                  aria-label={option}
                  className={`relative inline-flex size-12 items-center justify-center rounded-pill border border-border-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${ruleSwatchClass(option)} ${
                    selected
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-surface-secondary"
                      : "hover:ring-1 hover:ring-border-interactive"
                  }`}
                >
                  {selected && (
                    <Check
                      className={`size-5 ${ruleSwatchCheckClass(option)}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("appearance.image")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("appearance.imageHint")}
          </p>
          <div className="mt-4">
            <Field id="rule-image" label={t("appearance.imagePreview")}>
              <input
                id="rule-image"
                dir="ltr"
                value={imageUrl}
                onChange={(event) => onImageUrlChange(event.target.value)}
                placeholder={t("appearance.imagePlaceholder")}
                className={inputClass(false)}
              />
            </Field>
          </div>
          <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-control border border-surface-variant/60 bg-surface-tertiary/30 sm:aspect-auto sm:h-48 md:max-w-xl">
            {imageUrl.trim() ? (
              <NextImage
                src={imageUrl.trim()}
                alt={t("appearance.imagePreview")}
                fill
                sizes="(min-width: 768px) 36rem, 100vw"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-24 items-center justify-center gap-2 text-dash-caption text-content-tertiary">
                <ImageIcon className="size-5" aria-hidden="true" />
                <span>{t("review.notSet")}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </Panel>
  );
}
