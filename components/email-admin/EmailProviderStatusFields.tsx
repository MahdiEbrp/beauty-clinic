"use client";

import { useTranslations } from "next-intl";

import { EmailToggle } from "./EmailToggle";
import type {
  EmailProviderFormSetter,
  EmailProviderFormState,
} from "./email-provider-form-types";

export function EmailProviderStatusFields({
  form,
  setValue,
}: {
  form: EmailProviderFormState;
  setValue: EmailProviderFormSetter;
}) {
  const t = useTranslations("emailProviderForm");
  return (
    <div className="mt-5 divide-y divide-border-primary">
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-dash-body font-bold text-content-primary">{t("status.active")}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{t("status.activeHint")}</p>
        </div>
        <EmailToggle
          checked={form.isActive}
          onChange={(value) => setValue("isActive", value)}
          label={t("status.active")}
        />
      </div>
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-dash-body font-bold text-content-primary">{t("status.default")}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{t("status.defaultHint")}</p>
        </div>
        <EmailToggle
          checked={form.isDefault}
          onChange={(value) => setValue("isDefault", value)}
          label={t("status.default")}
        />
      </div>
    </div>
  );
}