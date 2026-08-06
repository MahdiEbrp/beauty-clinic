"use client";

import { useTranslations } from "next-intl";
import { UserRound, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

const fieldClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const labelClass = "block text-caption font-medium text-content-secondary mb-2";

export default function RegisterFields({
  fullName,
  email,
  phone,
  password,
  showPassword,
  errors,
  onChange,
  onTogglePassword,
  fieldError,
}: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  showPassword: boolean;
  errors: Record<string, string[] | undefined>;
  onChange: (
    field: "fullName" | "email" | "phone" | "password",
    value: string,
  ) => void;
  onTogglePassword: () => void;
  fieldError: (field: string) => string | null;
}) {
  const t = useTranslations();
  const fields = [
    {
      id: "register-name",
      name: "fullName" as const,
      label: t("register.fullName"),
      placeholder: t("register.fullNamePlaceholder"),
      value: fullName,
      Icon: UserRound,
      autoComplete: "name",
      type: "text",
    },
    {
      id: "register-email",
      name: "email" as const,
      label: t("register.email"),
      placeholder: t("register.emailPlaceholder"),
      value: email,
      Icon: Mail,
      autoComplete: "email",
      type: "email",
    },
    {
      id: "register-phone",
      name: "phone" as const,
      label: t("register.phone"),
      placeholder: t("register.phonePlaceholder"),
      value: phone,
      Icon: Phone,
      autoComplete: "tel",
      type: "tel",
    },
  ];

  return (
    <>
      {fields.map(
        ({ id, name, label, placeholder, value, Icon, autoComplete, type }) => {
          const error = fieldError(name);
          return (
            <div key={id}>
              <label htmlFor={id} className={labelClass}>
                {label}
              </label>
              <div className="relative">
                <Icon
                  className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <input
                  type={type}
                  id={id}
                  name={name}
                  value={value}
                  onChange={(event) => onChange(name, event.target.value)}
                  autoComplete={autoComplete}
                  inputMode={
                    name === "email"
                      ? "email"
                      : name === "phone"
                        ? "tel"
                        : undefined
                  }
                  dir={name === "fullName" ? undefined : "ltr"}
                  placeholder={placeholder}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`${fieldClass} ps-12 ${name !== "fullName" ? "text-end" : ""}`}
                />
              </div>
              {error && (
                <p
                  id={`${id}-error`}
                  className="text-body-sm text-error mt-2"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          );
        },
      )}

      <div>
        <label htmlFor="register-password" className={labelClass}>
          {t("register.password")}
        </label>
        <div className="relative">
          <Lock
            className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            type={showPassword ? "text" : "password"}
            id="register-password"
            name="password"
            value={password}
            onChange={(event) => onChange("password", event.target.value)}
            autoComplete="new-password"
            dir="ltr"
            placeholder={t("register.passwordPlaceholder")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password
                ? "register-password-hint register-password-error"
                : "register-password-hint"
            }
            className={`${fieldClass} ps-12 pe-12 text-end`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={
              showPassword
                ? t("register.hidePassword")
                : t("register.showPassword")
            }
            aria-pressed={showPassword}
            className="absolute top-1/2 -translate-y-1/2 inset-s-3 inline-flex items-center justify-center w-11 h-11 rounded-control text-content-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        <p
          id="register-password-hint"
          className="text-caption text-content-tertiary mt-2"
        >
          {t("register.passwordHint")}
        </p>
        {fieldError("password") && (
          <p
            id="register-password-error"
            className="text-body-sm text-error mt-2"
            role="alert"
          >
            {fieldError("password")}
          </p>
        )}
      </div>
    </>
  );
}
