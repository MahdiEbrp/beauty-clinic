"use client";

import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";

import type { GroupWizardNamespace } from "../types";
import GroupGlyph from "../GroupGlyph";
import { Panel } from "../ui";

export default function AppearanceStep({
  iconKey,
  onOpenIconPicker,
  imageUrl,
  onImageUrlChange,
  ns,
}: {
  iconKey: string;
  onOpenIconPicker: () => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  ns?: GroupWizardNamespace;
}) {
  const t = useTranslations(ns ?? "groupWizard");

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
            <div className="flex size-20 shrink-0 items-center justify-center rounded-panel border border-border-primary bg-surface-tertiary/40 text-copper-strong sm:size-24">
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
            {t("appearance.image")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("appearance.imageHint")}
          </p>
          <div className="mt-4">
            <ImageUploader
              id="group-image"
              value={imageUrl}
              onChange={onImageUrlChange}
              label={t("appearance.imagePreview")}
              hint={t("appearance.imageHint")}
              placeholder={t("appearance.imagePlaceholder")}
            />
          </div>
        </section>
      </div>
    </Panel>
  );
}
