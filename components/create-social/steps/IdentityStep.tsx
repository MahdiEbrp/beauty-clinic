"use client";

import { useTranslations } from "next-intl";
import { Field, Panel, inputClass } from "../../create-group/ui";
import ImageUploader from "@/components/shared/ImageUploader";
import { LangBadge } from "../../landing-admin/forms/fields";
import type { Locale } from "../types";
import type { FieldErrors } from "../types";

export default function IdentityStep({
  lang,
  labelFa,
  onLabelFaChange,
  labelEn,
  onLabelEnChange,
  url,
  onUrlChange,
  imageUrl,
  onImageUrlChange,
  errors,
  ns,
}: {
  lang: Locale;
  labelFa: string;
  onLabelFaChange: (value: string) => void;
  labelEn: string;
  onLabelEnChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  errors: FieldErrors;
  ns?: "socialWizard";
}) {
  const t = useTranslations(ns ?? "socialWizard");

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="mb-4">
          <LangBadge lang={lang} />
        </div>
        <div className="grid gap-6">
          <Field
            id="social-label"
            label={lang === "fa" ? t("identity.labelFa") : t("identity.labelEn")}
            error={lang === "fa" ? errors.labelFa : errors.labelEn}
            required
          >
            <input
              id="social-label"
              value={lang === "fa" ? labelFa : labelEn}
              onChange={(event) =>
                lang === "fa" ? onLabelFaChange(event.target.value) : onLabelEnChange(event.target.value)
              }
              className={inputClass(Boolean(lang === "fa" ? errors.labelFa : errors.labelEn))}
            />
          </Field>
          <Field id="social-url" label={t("identity.url")} error={errors.url} hint={t("identity.urlHint")} required>
            <input
              id="social-url"
              dir="ltr"
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder="https://..."
              className={inputClass(Boolean(errors.url))}
            />
          </Field>
          <ImageUploader
            id="social-image"
            value={imageUrl}
            onChange={onImageUrlChange}
            label={t("identity.imageUrl")}
            hint={t("identity.imageUrlHint")}
          />
        </div>
      </Panel>
    </div>
  );
}