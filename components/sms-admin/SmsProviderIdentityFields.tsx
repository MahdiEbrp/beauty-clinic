"use client";

import type { SmsProviderKind } from "@/src/db/schema";
import { useTranslations } from "next-intl";

import { getSmsProviderOption, SMS_PROVIDER_OPTIONS } from "@/data/sms-providers";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import { SMS_PROVIDER_DEFAULTS } from "@/lib/sms/constants";
import { Field, inputClass } from "@/components/create-group/ui";
import { SmsSelect, type SmsSelectOption } from "./common";
import type {
  SmsProviderFormSetter,
  SmsProviderFormState,
} from "./provider-form-types";

export function SmsProviderIdentityFields({
  form,
  provider,
  setValue,
  setKind,
}: {
  form: SmsProviderFormState;
  provider?: AdminSmsProvider;
  setValue: SmsProviderFormSetter;
  setKind: (kind: SmsProviderKind) => void;
}) {
  const t = useTranslations("smsProviderForm");
  const smsT = useTranslations("smsAdmin");
  const option = getSmsProviderOption(form.kind);
  const providerOptions: SmsSelectOption[] = SMS_PROVIDER_OPTIONS.map((item) => ({
    value: item.kind,
    label: smsT(item.labelKey as never),
  }));

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field id="sms-provider-name" label={t("fields.name")} hint={t("fields.nameHint")} required>
        <input
          id="sms-provider-name"
          value={form.name}
          onChange={(event) => setValue("name", event.target.value)}
          className={inputClass(!form.name.trim())}
          autoComplete="organization"
        />
      </Field>
      <Field id="sms-provider-kind" label={t("fields.kind")} required>
        <SmsSelect
          value={form.kind}
          onValueChange={(value) => setKind(value as SmsProviderKind)}
          options={providerOptions}
          placeholder={t("fields.kind")}
          ariaLabel={t("fields.kind")}
        />
      </Field>
      <Field
        id="sms-provider-url"
        label={t("fields.apiUrl")}
        hint={t("fields.apiUrlHint", { url: option.defaultApiUrl || t("fields.apiUrl") })}
        required
      >
        <input
          id="sms-provider-url"
          dir="ltr"
          type="url"
          value={form.apiUrl}
          onChange={(event) => setValue("apiUrl", event.target.value)}
          className={inputClass(!form.apiUrl.trim())}
          placeholder={option.defaultApiUrl}
          autoComplete="url"
        />
      </Field>
      <Field
        id="sms-provider-token"
        label={t("fields.token")}
        hint={provider?.tokenConfigured ? t("fields.tokenConfigured") : t("fields.tokenHint")}
        required={!provider}
      >
        <input
          id="sms-provider-token"
          dir="ltr"
          type="password"
          value={form.token}
          onChange={(event) => setValue("token", event.target.value)}
          className={inputClass(!provider && !form.token.trim())}
          autoComplete="new-password"
        />
      </Field>
      <Field id="sms-provider-sender" label={t("fields.sender")} hint={t("fields.senderHint")}>
        <input
          id="sms-provider-sender"
          dir="ltr"
          value={form.sender}
          onChange={(event) => setValue("sender", event.target.value)}
          className={inputClass(false)}
        />
      </Field>
    </div>
  );
}

export function updateProviderKind(
  current: SmsProviderFormState,
  kind: SmsProviderKind,
): SmsProviderFormState {
  const currentDefault = getSmsProviderOption(current.kind).defaultApiUrl;
  const nextDefault = getSmsProviderOption(kind).defaultApiUrl;
  return {
    ...current,
    kind,
    apiUrl: current.apiUrl === currentDefault ? nextDefault : current.apiUrl,
    authScheme: current.authScheme || SMS_PROVIDER_DEFAULTS.authScheme,
  };
}
