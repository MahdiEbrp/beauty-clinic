"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ShieldAlert } from "lucide-react";
import { toFieldErrors } from "@/lib/validation/field-errors";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validation/otp";
import BrandLogo from "@/components/BrandLogo";
import { PhoneStep, maskPhone } from "./PhoneStep";
import { VerifyStep } from "./VerifyStep";

type FieldErrors = Record<string, string[] | undefined>;

type ServerError = {
  code: string;
  message: string;
  details?: { attemptsLeft?: number; retryAfterMs?: number };
};

type OtpResponse = { expiresInMs: number; resendInMs: number };

const errorBannerClass =
  "flex items-start gap-3 bg-error/10 border border-error/40 rounded-control p-4";

export default function OtpLoginForm() {
  const t = useTranslations();
  const router = useRouter();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const translateServerError = (error: ServerError): string => {
    switch (error.code) {
      case "INVALID_CODE":
        return t("login.otp.errors.invalidCode");
      case "CODE_EXPIRED":
        return t("login.otp.errors.codeExpired");
      case "TOO_MANY_ATTEMPTS":
        return t("login.otp.errors.tooManyAttempts");
      case "RESEND_COOLDOWN":
        return t("login.otp.errors.resendCooldown");
      case "LOCKED_OUT": {
        const minutes = error.details?.retryAfterMs
          ? Math.max(1, Math.ceil(error.details.retryAfterMs / 60_000))
          : 15;
        return t("login.otp.errors.lockedOut", { minutes: String(minutes) });
      }
      case "PROVIDER_UNAVAILABLE":
        return t("login.otp.errors.providerUnavailable");
      case "ACCOUNT_INACTIVE":
      case "ACCOUNT_BANNED":
        return t("login.otp.errors.accountInactive");
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

  const fetchOtp = async (
    path: "/api/v1/auth/otp/request" | "/api/v1/auth/otp/resend",
    body: Record<string, string>,
  ): Promise<{ ok: boolean; error?: ServerError }> => {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as {
      data?: { ok: boolean } & OtpResponse;
      error?: ServerError;
    };
    if (!response.ok || !payload.data?.ok) {
      return { ok: false, error: payload.error };
    }
    setExpiresAt(Date.now() + payload.data.expiresInMs);
    setResendAt(Date.now() + payload.data.resendInMs);
    setAttemptsLeft(null);
    setCode("");
    setCodeError(null);
    return { ok: true };
  };

  const handleRequest = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = requestOtpSchema.safeParse({ phone, channel });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const result = await fetchOtp("/api/v1/auth/otp/request", parsed.data);
      if (!result.ok) {
        setFormError(
          result.error ? translateServerError(result.error) : t("login.errors.generic"),
        );
        return;
      }
      setStep("verify");
    } catch {
      setFormError(t("login.errors.network"));
    } finally {
      setPending(false);
    }
  };

  const handleResend = async () => {
    setFormError(null);
    setResending(true);
    try {
      const result = await fetchOtp("/api/v1/auth/otp/resend", {
        phone,
        channel,
      });
      if (!result.ok) {
        setFormError(
          result.error ? translateServerError(result.error) : t("login.errors.generic"),
        );
      }
    } catch {
      setFormError(t("login.errors.network"));
    } finally {
      setResending(false);
    }
  };

  const submitVerify = async (verifyCode: string) => {
    setFormError(null);
    setCodeError(null);
    const parsed = verifyOtpSchema.safeParse({ phone, code: verifyCode });
    if (!parsed.success) {
      setCodeError(t("login.otp.errors.codeInvalid"));
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as {
        data?: { ok: boolean };
        error?: ServerError;
      };

      if (!response.ok || !payload.data?.ok) {
        const error = payload.error;
        setFormError(error ? translateServerError(error) : t("login.errors.generic"));
        if (error?.details?.attemptsLeft !== undefined) {
          setAttemptsLeft(error.details.attemptsLeft);
        }
        if (error?.code === "INVALID_CODE") setCode("");
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

  const handleVerify = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitVerify(code);
  };

  const handleChangePhone = () => {
    setStep("request");
    setExpiresAt(null);
    setResendAt(null);
    setAttemptsLeft(null);
    setCode("");
    setCodeError(null);
    setFormError(null);
  };

  const invalidPhone = Boolean(errors.phone);

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-2 p-8 sm:p-12 max-w-prose mx-auto relative overflow-hidden">
          <div className="w-14 h-14 bg-surface-tertiary text-copper rounded-control flex items-center justify-center mb-6 border border-border-primary">
            <BrandLogo alt={t("site.name")} className="max-h-7 h-auto" />
          </div>

          <h1 className="text-heading-1 font-bold text-accent mb-4">
            {step === "request" ? t("login.heading") : t("login.otp.codeHeading")}
          </h1>
          <p className="text-body text-content-secondary mb-10">
            {step === "request"
              ? t("login.description")
              : t("login.otp.codeDescription", { destination: maskPhone(phone) })}
          </p>

          {formError && (
            <div
              role="alert"
              aria-live="polite"
              className={`${errorBannerClass} mb-6`}
            >
              <ShieldAlert
                className="w-5 h-5 text-error shrink-0 mt-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
              <p className="text-body-sm text-error font-medium">{formError}</p>
            </div>
          )}

          {step === "request" ? (
            <PhoneStep
              phone={phone}
              onPhoneChange={setPhone}
              channel={channel}
              onChannelChange={setChannel}
              invalidPhone={invalidPhone}
              pending={pending}
              onSubmit={(event) => void handleRequest(event)}
            />
          ) : (
            <VerifyStep
              code={code}
              onCodeChange={setCode}
              onCodeComplete={(completedCode) => {
                if (!pending) void submitVerify(completedCode);
              }}
              expiresAt={expiresAt}
              resendAt={resendAt}
              attemptsLeft={attemptsLeft}
              pending={pending}
              resending={resending}
              codeError={codeError}
              onResend={() => void handleResend()}
              onChangePhone={handleChangePhone}
              onSubmit={(event) => void handleVerify(event)}
            />
          )}

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
