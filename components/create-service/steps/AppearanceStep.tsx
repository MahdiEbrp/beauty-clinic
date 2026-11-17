"use client";

import { useTranslations } from "next-intl";
import ImageUploader from "@/components/shared/ImageUploader";

import { Panel } from "@/components/create-group/ui";

export default function AppearanceStep({
  imageUrl,
  onImageUrlChange,
  ns,
}: {
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  ns?: "serviceWizard";
}) {
  const t = useTranslations(ns ?? "serviceWizard");

  return (
    <Panel>
      <div className="grid gap-8 sm:gap-10">
        <section>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("appearance.image")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("appearance.imageHint")}
          </p>
          <div className="mt-4">
            <ImageUploader
              id="service-cover"
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
