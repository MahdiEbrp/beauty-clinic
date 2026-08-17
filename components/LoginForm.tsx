"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { loginSchema } from "@/lib/validation/user";
import { toFieldErrors } from "@/lib/validation/field-errors";
import BrandLogo from "@/components/BrandLogo";

const fieldClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const labelClass = "block text-caption font-medium text-content-secondary mb-2";

type FieldErrors = Record<string, string[] | undefined>;

type ServerError = {
  code: string;
  message: string;
  details?: { [key: string]: string[] | undefined };
};

export default function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const translateServerError = (error: ServerError): string => {
    switch (error.code) {
      case "INVALID_CREDENTIALS":
        return t("login.errors.invalidCredentials");
      case "RATE_LIMITED":
        return t("login.errors.rateLimited");
      case "VALIDATION_ERROR":
        return t("login.errors.validation");
      case "CROSS_ORIGIN_FORBIDDEN":
        return t("login.errors.csrf");
      case "INTERNAL_SERVER_ERROR":
        return t("login.errors.generic");
      default:
        return t("login.errors.generic");
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as {
        data?: { ok: boolean };
        error?: ServerError;
      };

      if (!response.ok || !payload.data?.ok) {
        setFormError(
          payload.error
            ? translateServerError(payload.error)
            : t("login.errors.generic"),
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError(t("login.errors.network"));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-2 p-8 sm:p-12 max-w-prose mx-auto relative overflow-hidden">
          <div className="w-14 h-14 bg-surface-tertiary text-copper rounded-control flex items-center justify-center mb-6 border border-border-primary">
            <BrandLogo alt={t("site.name")} className="max-h-7 h-auto" />
          </div>

          <h1 className="text-heading-1 font-bold text-accent mb-4">
            {t("login.heading")}
          </h1>
          <p className="text-body text-content-secondary mb-10">
            {t("login.description")}
          </p>

          <form onSubmit={(event) => void handleSubmit(event)} noValidate>
            <div className="grid gap-6">
              <div>
                <label htmlFor="login-email" className={labelClass}>
                  {t("login.email")}
                </label>
                <div className="relative">
                  <Mail
                    className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    dir="ltr"
                    placeholder={t("login.emailPlaceholder")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                    className={`${fieldClass} ps-12 text-center`}
                  />
                </div>
                {errors.email && (
                  <p id="login-email-error" className="text-body-sm text-error mt-2" role="alert">
                    {t("login.errors.invalidEmail")}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className={labelClass}>
                  {t("login.password")}
                </label>
                <div className="relative">
                  <Lock
                    className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    dir="ltr"
                    placeholder={t("login.passwordPlaceholder")}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "login-password-error" : undefined
                    }
                    className={`${fieldClass} ps-12 pe-12 text-center`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? t("login.hidePassword") : t("login.showPassword")
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
                {errors.password && (
                  <p id="login-password-error" className="text-body-sm text-error mt-2" role="alert">
                    {t("login.errors.requiredPassword")}
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
                    <span>{t("login.loggingIn")}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
                    <span>{t("login.submit")}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-body-sm text-content-secondary text-center mt-8">
            {t("login.createAccountPrompt")}{" "}
            <Link
              href="/register"
              className="font-semibold text-accent underline underline-offset-4 hover:text-accent-hover rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("login.createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
