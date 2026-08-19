"use client";

import { useTranslations } from "next-intl";
import { Field, Panel, inputClass } from "@/components/create-group/ui";
import { IconField, ImageUrlField } from "../../forms/fields";
import { isStat, usesIcon, usesImage } from "../steps";
import type { FieldErrors } from "../types";
import type { CollectionKey } from "../../types";

function StatValueFields({
  value,
  onValueChange,
  plus,
  onTogglePlus,
  compact,
  onToggleCompact,
  error,
}: {
  value: string;
  onValueChange: (value: string) => void;
  plus: boolean;
  onTogglePlus: () => void;
  compact: boolean;
  onToggleCompact: () => void;
  error?: string;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="grid gap-6">
        <Field
          id="stat-value"
          label={t("fields.value")}
          hint={t("fields.valueHint")}
          error={error}
          required
        >
          <input
            id="stat-value"
            dir="ltr"
            inputMode="numeric"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            className={inputClass(Boolean(error))}
          />
        </Field>

        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("fields.plus")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("fields.plusHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={plus}
            aria-label={t("fields.plus")}
            onClick={onTogglePlus}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              plus ? "bg-copper" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                plus ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("fields.compact")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("fields.compactHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compact}
            aria-label={t("fields.compact")}
            onClick={onToggleCompact}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              compact ? "bg-accent" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                compact ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default function AppearanceStep({
  collection,
  iconKey,
  onOpenIconPicker,
  imageUrl,
  onImageUrlChange,
  value,
  onValueChange,
  plus,
  onTogglePlus,
  compact,
  onToggleCompact,
  errors,
}: {
  collection: CollectionKey;
  iconKey: string;
  onOpenIconPicker: () => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  plus: boolean;
  onTogglePlus: () => void;
  compact: boolean;
  onToggleCompact: () => void;
  errors: FieldErrors;
}) {
  return (
    <div className="space-y-6">
      {usesIcon(collection) && (
        <IconField iconKey={iconKey} onOpenPicker={onOpenIconPicker} />
      )}
      {usesImage(collection) && (
        <ImageUrlField value={imageUrl} onChange={onImageUrlChange} />
      )}
      {isStat(collection) && (
        <StatValueFields
          value={value}
          onValueChange={onValueChange}
          plus={plus}
          onTogglePlus={onTogglePlus}
          compact={compact}
          onToggleCompact={onToggleCompact}
          error={errors.value}
        />
      )}
    </div>
  );
}