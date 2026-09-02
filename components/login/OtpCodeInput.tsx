"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

/**
 * 6-digit code entry: one real (invisible) input sits above six presentational
 * digit boxes, so paste, backspace, caret and screen-reader semantics all work
 * natively while the boxes give the visual OTP feel.
 */
export function OtpCodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const t = useTranslations();
  const inputId = useId();

  const handleChange = (raw: string) => {
    const next = raw.replace(/\D/g, "").slice(0, 6);
    onChange(next);
    if (next.length === 6) onComplete?.(next);
  };

  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  return (
    <div dir="ltr">
      <label htmlFor={inputId} className="sr-only">
        {t("login.otp.codeLabel")}
      </label>
      <div
        className={`relative grid grid-cols-6 gap-2 rounded-control focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
          invalid ? "outline outline-error/60" : ""
        }`}
      >
        {digits.map((digit, index) => (
          <div
            key={index}
            aria-hidden="true"
            className={`h-14 rounded-control border bg-form-input-bg flex items-center justify-center text-heading-2 text-accent transition-colors ${
              invalid ? "border-error" : "border-form-input-border"
            } ${index === value.length ? "border-accent" : ""}`}
          >
            {digit === " " ? "" : digit}
          </div>
        ))}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={invalid}
          aria-label={t("login.otp.codeLabel")}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        />
      </div>
    </div>
  );
}
