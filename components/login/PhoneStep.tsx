"use client";

import { useTranslations } from "next-intl";
import { Loader2, Mail, Phone, Send } from "lucide-react";
import { ChannelPicker } from "./ChannelPicker";

const fieldClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const labelClass = "block text-caption font-medium text-content-secondary mb-2";

export function PhoneStep({
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  channel,
  onChannelChange,
  invalid,
  pending,
  onSubmit,
}: {
  phone: string;
  onPhoneChange: (phone: string) => void;
  email: string;
  onEmailChange: (email: string) => void;
  channel: "sms" | "email";
  onChannelChange: (channel: "sms" | "email") => void;
  invalid: boolean;
  pending: boolean;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}) {
  const t = useTranslations();
  // SMS only — email disabled; variables kept for future re-enable
  const isEmail = false;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <div>
        <label htmlFor="otp-login-contact" className={labelClass}>
          {isEmail ? t("login.otp.email") : t("login.otp.phone")}
        </label>
        <div className="relative">
          {isEmail ? (
            <Mail
              className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            <Phone
              className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
          {isEmail ? (
            <input
              type="email"
              id="otp-login-contact"
              name="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value.trim())}
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              autoFocus
              placeholder={t("login.otp.emailPlaceholder")}
              aria-invalid={invalid}
              aria-describedby={invalid ? "otp-login-contact-error" : undefined}
              className={`${fieldClass} ps-12 text-end`}
            />
          ) : (
            <input
              type="tel"
              id="otp-login-contact"
              name="phone"
              value={phone}
              onChange={(event) =>
                onPhoneChange(event.target.value.replace(/[^0-9+]/g, ""))
              }
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              autoFocus
              placeholder={t("login.otp.phonePlaceholder")}
              aria-invalid={invalid}
              aria-describedby={invalid ? "otp-login-contact-error" : undefined}
              className={`${fieldClass} ps-12 text-end`}
            />
          )}
        </div>
        {invalid && (
          <p
            id="otp-login-contact-error"
            className="text-body-sm text-error mt-2"
            role="alert"
          >
            {isEmail
              ? t("login.otp.errors.invalidEmail")
              : t("login.otp.errors.invalidPhone")}
          </p>
        )}
      </div>

      {/* Channel picker hidden — SMS only; re-enable by removing this wrapper */}
      {false && (
        <fieldset>
          <legend className={labelClass}>{t("login.otp.channelLabel")}</legend>
          <ChannelPicker
            value={channel}
            onChange={onChannelChange}
            disabled={pending}
          />
        </fieldset>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 min-h-13 text-body bg-accent text-content-contrast rounded-pill font-bold border border-transparent transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 disabled:opacity-60 disabled:pointer-events-none w-full"
      >
        {pending ? (
          <>
            <Loader2
              className="w-5 h-5 animate-spin"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{t("login.otp.sendingCode")}</span>
          </>
        ) : (
          <>
            <Send
              className="w-5 h-5 rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{t("login.otp.sendCode")}</span>
          </>
        )}
      </button>
    </form>
  );
}

/** Masks a phone for display (client-safe; keeps prefix and last 3 digits). */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 7) return `${phone.slice(0, 3)}•••`;
  return `${digits.slice(0, Math.min(4, digits.length - 3))}•••${digits.slice(-3)}`;
}

/** Masks an email for display (client-safe, e.g. `jo••••@gmail.com`). */
export function maskEmail(email: string): string {
  const value = email.trim().toLowerCase();
  const atIndex = value.indexOf("@");
  if (atIndex <= 1) return "••••";
  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex);
  return `${local.slice(0, 2)}••••${domain}`;
}
