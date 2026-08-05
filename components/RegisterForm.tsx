"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import {
  Wind,
  UserRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { signupSchema } from "@/lib/validation/user";

const fieldClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const labelClass = "block text-caption font-medium text-content-secondary mb-2";

type FieldErrors = Record<string, string[] | undefined>;

type ServerError = {
  code: string;
  message: string;
  details?: { [key: string]: string[] | undefined };
};

export default function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const translateServerError = (error: ServerError): string => {
    switch (error.code) {
      case "EMAIL_TAKEN":
        return t("register.errors.emailTaken");
      case "RATE_LIMITED":
        return t("register.errors.rateLimited");
      case "VALIDATION_ERROR":
        return t("register.errors.validation");
      case "CROSS_ORIGIN_FORBIDDEN":
        return t("register.errors.csrf");
      case "INTERNAL_SERVER_ERROR":
        return t("register.errors.generic");
      default:
        return t("register.errors.generic");
    }
  };

  const fieldError = (field: string) => {
    if (!errors[field]?.length) return null;
    switch (field) {
      case "fullName":
        return t("register.errors.invalidName");
      case "email":
        return t("register.errors.invalidEmail");
      case "phone":
        return t("register.errors.invalidPhone");
      case "password":
        return t("register.errors.invalidPassword");
      default:
        return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse({ fullName, email, phone, password });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send "" for an empty phone: signupSchema transforms "" -> null, so
        // sending the transformed null would fail server-side re-validation.
        body: JSON.stringify({ ...parsed.data, phone: parsed.data.phone ?? "" }),
      });

      const payload = (await response.json()) as {
        data?: { ok: boolean };
        error?: ServerError;
      };

      if (!response.ok || !payload.data?.ok) {
        setFormError(
          payload.error
            ? translateServerError(payload.error)
            : t("register.errors.generic"),
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError(t("register.errors.network"));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-2 p-8 sm:p-12 max-w-prose mx-auto relative overflow-hidden">
          <div className="w-14 h-14 bg-surface-tertiary text-copper rounded-control flex items-center justify-center mb-6 border border-border-primary">
            <Wind className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
          </div>

          <h1 className="text-heading-1 font-bold text-accent mb-4">
            {t("register.heading")}
          </h1>
          <p className="text-body text-content-secondary mb-10">
            {t("register.description")}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6">
              <div>
                <label htmlFor="register-name" className={labelClass}>
                  {t("register.fullName")}
                </label>
                <div className="relative">
                  <UserRound
                    className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    id="register-name"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    placeholder={t("register.fullNamePlaceholder")}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={
                      errors.fullName ? "register-name-error" : undefined
                    }
                    className={`${fieldClass} ps-12`}
                  />
                </div>
                {fieldError("fullName") && (
                  <p id="register-name-error" className="text-body-sm text-error mt-2" role="alert">
                    {fieldError("fullName")}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className={labelClass}>
                  {t("register.email")}
                </label>
                <div className="relative">
                  <Mail
                    className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    dir="ltr"
                    placeholder={t("register.emailPlaceholder")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "register-email-error" : undefined
                    }
                    className={`${fieldClass} ps-12 text-end`}
                  />
                </div>
                {fieldError("email") && (
                  <p id="register-email-error" className="text-body-sm text-error mt-2" role="alert">
                    {fieldError("email")}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-phone" className={labelClass}>
                  {t("register.phone")}
                </label>
                <div className="relative">
                  <Phone
                    className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    type="tel"
                    id="register-phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                    placeholder={t("register.phonePlaceholder")}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? "register-phone-error" : undefined
                    }
                    className={`${fieldClass} ps-12 text-end`}
                  />
                </div>
                {fieldError("phone") && (
                  <p id="register-phone-error" className="text-body-sm text-error mt-2" role="alert">
                    {fieldError("phone")}
                  </p>
                )}
              </div>

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
                    onChange={(e) => setPassword(e.target.value)}
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
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? t("register.hidePassword") : t("register.showPassword")
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
                <p id="register-password-hint" className="text-caption text-content-tertiary mt-2">
                  {t("register.passwordHint")}
                </p>
                {fieldError("password") && (
                  <p id="register-password-error" className="text-body-sm text-error mt-2" role="alert">
                    {fieldError("password")}
                  </p>
                )}
              </div>

              {formError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-3 bg-error/10 border border-error/40 rounded-control p-4"
                >
                  <ShieldAlert
                    className="w-5 h-5 text-error shrink-0 mt-0.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <p className="text-body-sm text-error font-medium">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 min-h-13 text-body bg-accent text-content-contrast rounded-pill font-bold border border-transparent transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 disabled:opacity-60 disabled:pointer-events-none w-full"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} aria-hidden="true" />
                    <span>{t("register.registering")}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
                    <span>{t("register.submit")}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-body-sm text-content-secondary text-center mt-8">
            {t("register.loginPrompt")}{" "}
            <Link
              href="/login"
              className="font-semibold text-accent underline underline-offset-4 hover:text-accent-hover rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("register.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
