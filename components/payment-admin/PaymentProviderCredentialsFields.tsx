"use client";

import { useTranslations } from "next-intl";

import { Field, inputClass } from "@/components/create-group/ui";
import { PaymentToggle } from "./PaymentToggle";
import type { PaymentProviderFormSetter, PaymentProviderFormState } from "./provider-form-types";

export function PaymentProviderCredentialsFields({
  form,
  setValue,
  isEdit,
}: {
  form: PaymentProviderFormState;
  setValue: PaymentProviderFormSetter;
  isEdit: boolean;
}) {
  const t = useTranslations("paymentProviderForm");
  return (
    <div className="mt-6 space-y-5">
      <Field id="payment-provider-merchant" label={t("fields.merchantId")} hint={isEdit ? t("fields.merchantIdEditHint") : t("fields.merchantIdHint")} required={!isEdit}>
        <input id="payment-provider-merchant" dir="ltr" type="password" value={form.merchantId} onChange={(e) => setValue("merchantId", e.target.value)} className={inputClass(!isEdit && !form.merchantId.trim())} autoComplete="new-password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
      </Field>
      <div className="flex items-center justify-between gap-4 rounded-control border border-surface-variant/50 bg-surface-tertiary/30 px-4 py-3">
        <div className="space-y-1">
          <p className="text-dash-body-sm font-semibold text-content-primary">{t("fields.sandbox")}</p>
          <p className="text-dash-body-sm text-content-secondary">{t("fields.sandboxHint")}</p>
        </div>
        <PaymentToggle checked={form.sandbox} onChange={(v) => setValue("sandbox", v)} label={t("fields.sandbox")} />
      </div>
      <p className="text-dash-body-sm text-content-secondary">{t("fields.fakeHint")}</p>
    </div>
  );
}
