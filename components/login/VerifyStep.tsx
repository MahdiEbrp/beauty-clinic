"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, LogIn, RefreshCw } from "lucide-react";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { OtpCodeInput } from "./OtpCodeInput";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-control border border-form-input-border text-body font-medium text-content-secondary transition-colors hover:border-border-interactive hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 disabled:pointer-events-none";

export function VerifyStep({
  code,
  onCodeChange,
  onCodeComplete,
  expiresAt,
  resendAt,
  attemptsLeft,
  pending,
  resending,
  codeError,
  onResend,
  onChangePhone,
  onSubmit,
}: {
  code: string;
  onCodeChange: (code: string) => void;
  /** Fired when the 6th digit is entered, with the completed code. */
  onCodeComplete: (code: string) => void;
  expiresAt: number | null;
  resendAt: number | null;
  attemptsLeft: number | null;
  pending: boolean;
  resending: boolean;
  /** Translated field-level error for the code box (client validation). */
  codeError: string | null;
  onResend: () => void;
  onChangePhone: () => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}) {
  const t = useTranslations();
  const expiry = useCountdown(expiresAt);
  const resend = useCountdown(resendAt);
  // Resend stays enabled once its own cooldown passes, even after the code
  // expires — requesting again arms a fresh code and restarts the expiry.
  const resendEnabled = !resending && resend.done;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <div>
        <OtpCodeInput
          value={code}
          onChange={onCodeChange}
          onComplete={onCodeComplete}
          disabled={pending || expiry.done}
          invalid={Boolean(codeError)}
          autoFocus
        />
        {codeError && (
          <p
            id="otp-login-code-error"
            className="text-body-sm text-error mt-2"
            role="alert"
          >
            {codeError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {expiry.done ? (
          <p className="text-body-sm text-error" role="status">
            {t("login.otp.errors.codeExpired")}
          </p>
        ) : (
          <p className="text-caption text-content-tertiary">
            {t("login.otp.expiresIn", { seconds: String(expiry.secondsLeft ?? "") })}
          </p>
        )}
        <button
          type="button"
          onClick={onResend}
          disabled={!resendEnabled}
          aria-busy={resending}
          className={secondaryButtonClass}
        >
          {resending ? (
            <Loader2
              className="w-5 h-5 animate-spin"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            <RefreshCw
              className="w-5 h-5 rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
          {resend.done
            ? t("login.otp.resend")
            : t("login.otp.resendIn", { seconds: String(resend.secondsLeft ?? "") })}
        </button>
      </div>

      {attemptsLeft !== null && (
        <p className="text-body-sm text-error font-medium" role="status">
          {t("login.otp.attemptsLeft", { count: String(attemptsLeft) })}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || code.length !== 6 || expiry.done}
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
            <span>{t("login.otp.verifying")}</span>
          </>
        ) : (
          <>
            <LogIn
              className="w-5 h-5 rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{t("login.otp.verify")}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onChangePhone}
        disabled={pending}
        className={`${secondaryButtonClass} w-full`}
      >
        <ArrowLeft
          className="w-5 h-5 rtl-mirror"
          strokeWidth={2}
          aria-hidden="true"
        />
        {t("login.otp.changePhone")}
      </button>
    </form>
  );
}
