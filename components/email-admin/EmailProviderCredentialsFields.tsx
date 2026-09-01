"use client";

import { useTranslations } from "next-intl";

import type { AdminEmailProvider } from "@/lib/email/provider-service";
import { Field, inputClass } from "@/components/create-group/ui";
import type {
  EmailProviderFormSetter,
  EmailProviderFormState,
} from "./email-provider-form-types";

export function EmailProviderCredentialsFields({
  form,
  provider,
  setValue,
}: {
  form: EmailProviderFormState;
  provider?: AdminEmailProvider;
  setValue: EmailProviderFormSetter;
}) {
  const t = useTranslations("emailProviderForm");
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field
        id="email-provider-username"
        label={t("fields.username")}
        hint={t("fields.usernameHint")}
        required={!provider}
      >
        <input
          id="email-provider-username"
          dir="ltr"
          value={form.username}
          onChange={(event) => setValue("username", event.target.value)}
          className={inputClass(false)}
          autoComplete="username"
        />
      </Field>
      <Field
        id="email-provider-password"
        label={t("fields.password")}
        hint={
          provider?.passwordConfigured
            ? t("fields.passwordConfigured")
            : t("fields.passwordHint")
        }
        required={!provider}
      >
        <input
          id="email-provider-password"
          dir="ltr"
          type="password"
          value={form.password}
          onChange={(event) => setValue("password", event.target.value)}
          className={inputClass(!provider && !form.password.trim())}
          autoComplete="new-password"
        />
      </Field>
    </div>
  );
}