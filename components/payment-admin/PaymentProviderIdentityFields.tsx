"use client";

import type { PaymentProviderKind } from "@/src/db/schema";
import { useTranslations } from "next-intl";

import { getPaymentProviderOption, PAYMENT_PROVIDER_OPTIONS } from "@/data/payment-providers";
import type { AdminPaymentProvider } from "@/lib/payment/provider-service";
import { Field, inputClass } from "@/components/create-group/ui";
import { PaymentSelect, type PaymentSelectOption } from "./PaymentSelect";
import type { PaymentProviderFormSetter, PaymentProviderFormState } from "./provider-form-types";

export function PaymentProviderIdentityFields({
  form,
  setValue,
  setKind,
}: {
  form: PaymentProviderFormState;
  provider?: AdminPaymentProvider;
  setValue: PaymentProviderFormSetter;
  setKind: (kind: PaymentProviderKind) => void;
}) {
  const t = useTranslations("paymentProviderForm");
  const adminT = useTranslations("paymentAdmin");
  const option = getPaymentProviderOption(form.kind as PaymentProviderKind);
  const providerOptions: PaymentSelectOption[] = PAYMENT_PROVIDER_OPTIONS.map((item) => ({
    value: item.kind,
    label: adminT(item.labelKey as never),
  }));

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field id="payment-provider-name" label={t("fields.name")} hint={t("fields.nameHint")} required>
        <input id="payment-provider-name" value={form.name} onChange={(e) => setValue("name", e.target.value)} className={inputClass(!form.name.trim())} autoComplete="organization" />
      </Field>
      <Field id="payment-provider-kind" label={t("fields.kind")} required>
        <PaymentSelect value={form.kind} onValueChange={(v) => setKind(v as PaymentProviderKind)} options={providerOptions} placeholder={t("fields.kind")} ariaLabel={t("fields.kind")} />
      </Field>
      <Field id="payment-provider-url" label={t("fields.apiUrl")} hint={t("fields.apiUrlHint", { url: option.defaultApiUrl || t("fields.apiUrl") })} required>
        <input id="payment-provider-url" dir="ltr" type="url" value={form.apiUrl} onChange={(e) => setValue("apiUrl", e.target.value)} className={inputClass(!form.apiUrl.trim())} placeholder={option.defaultApiUrl} autoComplete="url" />
      </Field>
      <Field id="payment-provider-callback" label={t("fields.callbackUrl")} hint={t("fields.callbackUrlHint")}>
        <input id="payment-provider-callback" dir="ltr" type="url" value={form.callbackUrl} onChange={(e) => setValue("callbackUrl", e.target.value)} className={inputClass(false)} placeholder="https://example.com/api/v1/payments/callback" />
      </Field>
    </div>
  );
}

export function updateProviderKind(current: PaymentProviderFormState, kind: PaymentProviderKind): PaymentProviderFormState {
  const currentDefault = getPaymentProviderOption(current.kind as PaymentProviderKind).defaultApiUrl;
  const nextDefault = getPaymentProviderOption(kind).defaultApiUrl;
  return { ...current, kind: kind as any, apiUrl: current.apiUrl === currentDefault ? nextDefault : current.apiUrl };
}
