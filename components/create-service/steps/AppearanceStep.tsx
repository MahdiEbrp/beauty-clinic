"use client";

import { useTranslations } from "next-intl";
import { Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";

import { Field, Panel, inputClass } from "@/components/create-group/ui";

export default function AppearanceStep({
  imageUrl,
  onImageUrlChange,
  ns,
}: {
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  ns?: string;
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
            <Field
              id="service-cover"
              label={t("appearance.imagePreview")}
              hint={t("appearance.imageHint")}
            >
              <input
                id="service-cover"
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
                alt={t("appearance.image")}
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
