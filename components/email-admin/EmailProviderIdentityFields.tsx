"use client";

import type { EmailEncryption, EmailProviderKind } from "@/src/db/schema";
import { useTranslations } from "next-intl";

import {
  EMAIL_PROVIDER_OPTIONS,
  getEmailProviderOption,
} from "@/data/email-providers";
import { Field, inputClass } from "@/components/create-group/ui";
import { EmailSelect, type EmailSelectOption } from "./EmailSelect";
import type {
  EmailProviderFormSetter,
  EmailProviderFormState,
} from "./email-provider-form-types";

export function EmailProviderIdentityFields({
  form,
  setValue,
  setKind,
}: {
  form: EmailProviderFormState;
  setValue: EmailProviderFormSetter;
  setKind: (kind: EmailProviderKind) => void;
}) {
  const t = useTranslations("emailProviderForm");
  const emailT = useTranslations("emailAdmin");
  const option = getEmailProviderOption(form.kind);
  const providerOptions: EmailSelectOption[] = EMAIL_PROVIDER_OPTIONS.map((item) => ({
    value: item.kind,
    label: emailT(item.labelKey as never),
  }));
  const encryptionOptions: EmailSelectOption[] = [
    { value: "ssl", label: t("options.ssl") },
    { value: "starttls", label: t("options.starttls") },
    { value: "none", label: t("options.none") },
  ];

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field id="email-provider-name" label={t("fields.name")} hint={t("fields.nameHint")} required>
        <input
          id="email-provider-name"
          value={form.name}
          onChange={(event) => setValue("name", event.target.value)}
          className={inputClass(!form.name.trim())}
          autoComplete="organization"
        />
      </Field>
      <Field
        id="email-provider-kind"
        label={t("fields.kind")}
        hint={emailT(option.descriptionKey as never)}
        required
      >
        <EmailSelect
          value={form.kind}
          onValueChange={(value) => setKind(value as EmailProviderKind)}
          options={providerOptions}
          placeholder={t("fields.kind")}
          ariaLabel={t("fields.kind")}
        />
      </Field>
      <Field
        id="email-provider-host"
        label={t("fields.host")}
        hint={t("fields.hostHint", { host: option.defaultHost || t("fields.host") })}
        required
      >
        <input
          id="email-provider-host"
          dir="ltr"
          type="text"
          value={form.host}
          onChange={(event) => setValue("host", event.target.value)}
          className={inputClass(!form.host.trim())}
          placeholder={option.defaultHost}
          autoComplete="off"
        />
      </Field>
      <Field
        id="email-provider-port"
        label={t("fields.port")}
        hint={t("fields.portHint")}
        required
      >
        <input
          id="email-provider-port"
          dir="ltr"
          type="number"
          inputMode="numeric"
          value={form.port}
          onChange={(event) => setValue("port", event.target.value)}
          className={inputClass(!form.port.trim())}
          placeholder={String(option.defaultPort)}
        />
      </Field>
      <Field id="email-provider-encryption" label={t("fields.encryption")} required>
        <EmailSelect
          value={form.encryption}
          onValueChange={(value) =>
            setValue("encryption", value as EmailEncryption)
          }
          options={encryptionOptions}
          placeholder={t("fields.encryption")}
          ariaLabel={t("fields.encryption")}
        />
      </Field>
      <Field
        id="email-provider-from-email"
        label={t("fields.fromEmail")}
        hint={t("fields.fromEmailHint")}
      >
        <input
          id="email-provider-from-email"
          dir="ltr"
          type="email"
          value={form.fromEmail}
          onChange={(event) => setValue("fromEmail", event.target.value)}
          className={inputClass(false)}
        />
      </Field>
      <Field id="email-provider-from-name" label={t("fields.fromName")}>
        <input
          id="email-provider-from-name"
          value={form.fromName}
          onChange={(event) => setValue("fromName", event.target.value)}
          className={inputClass(false)}
        />
      </Field>
    </div>
  );
}

export function updateProviderKind(
  current: EmailProviderFormState,
  kind: EmailProviderKind,
): EmailProviderFormState {
  const currentOption = getEmailProviderOption(current.kind);
  const nextOption = getEmailProviderOption(kind);
  return {
    ...current,
    kind,
    host:
      current.host === currentOption.defaultHost
        ? nextOption.defaultHost
        : current.host,
    port: String(nextOption.defaultPort),
    encryption: nextOption.defaultEncryption,
  };
}