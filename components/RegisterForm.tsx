"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { Wind, Loader2, UserPlus, ShieldAlert } from "lucide-react";
import { signupSchema } from "@/lib/validation/user";
import RegisterFields from "@/components/register/RegisterFields";

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
              <RegisterFields fullName={fullName} email={email} phone={phone} password={password} showPassword={showPassword} errors={errors} onChange={(field, value) => { if (field === "fullName") setFullName(value); else if (field === "email") setEmail(value); else if (field === "phone") setPhone(value); else setPassword(value); }} onTogglePassword={() => setShowPassword((visible) => !visible)} fieldError={fieldError} />

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
