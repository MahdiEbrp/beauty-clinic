"use client";

import { useTranslations } from "next-intl";

import { Field, inputClass } from "@/components/create-group/ui";
import { SmsSelect, type SmsSelectOption } from "./common";
import type {
  SmsProviderFormSetter,
  SmsProviderFormState,
} from "./provider-form-types";

export function SmsProviderCredentialsFields({
  form,
  setValue,
}: {
  form: SmsProviderFormState;
  setValue: SmsProviderFormSetter;
}) {
  const t = useTranslations("smsProviderForm");
  const authOptions: SmsSelectOption[] = [
    { value: "bearer", label: t("options.bearer") },
    { value: "x-api-key", label: t("options.xApiKey") },
    { value: "token", label: t("options.token") },
    { value: "none", label: t("options.none") },
  ];
  const payloadOptions: SmsSelectOption[] = [
    { value: "standard", label: t("options.standard") },
    { value: "bulk", label: t("options.bulk") },
  ];

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field id="sms-auth-scheme" label={t("fields.authScheme")}>
        <SmsSelect
          value={form.authScheme}
          onValueChange={(value) => setValue("authScheme", value as SmsProviderFormState["authScheme"])}
          options={authOptions}
          placeholder={t("fields.authScheme")}
          ariaLabel={t("fields.authScheme")}
        />
      </Field>
      <Field id="sms-auth-header" label={t("fields.authHeader")}>
        <input
          id="sms-auth-header"
          dir="ltr"
          value={form.authHeader}
          onChange={(event) => setValue("authHeader", event.target.value)}
          className={inputClass(false)}
          placeholder={t("fields.authHeaderPlaceholder")}
        />
      </Field>
      <Field id="sms-line-number" label={t("fields.lineNumber")}>
        <input
          id="sms-line-number"
          dir="ltr"
          value={form.lineNumber}
          onChange={(event) => setValue("lineNumber", event.target.value)}
          className={inputClass(false)}
        />
      </Field>
      <Field id="sms-payload-mode" label={t("fields.payloadMode")}>
        <SmsSelect
          value={form.payloadMode}
          onValueChange={(value) => setValue("payloadMode", value as SmsProviderFormState["payloadMode"])}
          options={payloadOptions}
          placeholder={t("fields.payloadMode")}
          ariaLabel={t("fields.payloadMode")}
        />
      </Field>
      <Field id="sms-username" label={t("fields.username")}>
        <input
          id="sms-username"
          dir="ltr"
          value={form.username}
          onChange={(event) => setValue("username", event.target.value)}
          className={inputClass(false)}
          autoComplete="username"
        />
      </Field>
      <Field id="sms-password" label={t("fields.password")}>
        <input
          id="sms-password"
          dir="ltr"
          type="password"
          value={form.password}
          onChange={(event) => setValue("password", event.target.value)}
          className={inputClass(false)}
          autoComplete="new-password"
        />
      </Field>
      <Field id="sms-api-key" label={t("fields.apiKey")}>
        <input
          id="sms-api-key"
          dir="ltr"
          type="password"
          value={form.apiKey}
          onChange={(event) => setValue("apiKey", event.target.value)}
          className={inputClass(false)}
          autoComplete="new-password"
        />
      </Field>
    </div>
  );
}
