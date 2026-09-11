"use client";

import { useTranslations } from "next-intl";

import { PaymentToggle } from "./PaymentToggle";
import type {
  PaymentProviderFormSetter,
  PaymentProviderFormState,
} from "./provider-form-types";

export function PaymentProviderStatusFields({
  form,
  setValue,
}: {
  form: PaymentProviderFormState;
  setValue: PaymentProviderFormSetter;
}) {
  const t = useTranslations("paymentProviderForm");
  return (
    <div className="mt-5 divide-y divide-border-primary">
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-dash-body font-bold text-content-primary">{t("status.active")}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{t("status.activeHint")}</p>
        </div>
        <PaymentToggle checked={form.isActive} onChange={(v) => setValue("isActive", v)} label={t("status.active")} />
      </div>
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-dash-body font-bold text-content-primary">{t("status.default")}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{t("status.defaultHint")}</p>
        </div>
        <PaymentToggle checked={form.isDefault} onChange={(v) => setValue("isDefault", v)} label={t("status.default")} />
      </div>
    </div>
  );
}
