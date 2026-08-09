"use client";

import { useState } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { changePasswordSchema } from "@/lib/validation/user";

export default function ForcedPasswordForm({ fullName }: { fullName: string }) {
  const t = useTranslations("resetPassword");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const parsed = changePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(t("invalid"));
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/v1/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error("failed");
      router.replace("/login");
      router.refresh();
    } catch {
      setError(t("error"));
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-4 py-8">
      <section className="w-full max-w-md rounded-panel border border-border-primary bg-surface-secondary p-6 shadow-elevation-3 sm:p-8">
        <div className="mb-7 flex size-12 items-center justify-center rounded-pill bg-accent text-content-contrast">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </div>
        <p className="text-dash-caption font-bold uppercase tracking-[0.14em] text-copper-strong">{t("eyebrow")}</p>
        <h1 className="mt-2 text-dash-title font-bold tracking-tight text-accent">{t("title")}</h1>
        <p className="mt-3 text-dash-body-sm leading-6 text-content-secondary">{t("description", { name: fullName })}</p>

        <form onSubmit={(event) => void submit(event)} className="mt-7 grid gap-5">
          <PasswordField id="forced-password" label={t("newPassword")} value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} toggleLabel={t("togglePassword")} />
          <PasswordField id="forced-password-confirm" label={t("confirmPassword")} value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} toggleLabel={t("togglePassword")} />
          {error && <p role="alert" className="rounded-control border border-error/30 bg-error/10 p-3 text-dash-body-sm font-medium text-error">{error}</p>}
          <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50">
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? t("saving") : t("save")}
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, toggleLabel }: { id: string; label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void; toggleLabel: string }) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-dash-caption font-bold text-content-secondary">
      <span>{label}</span>
      <span className="relative block">
        <input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} dir="ltr" autoComplete="new-password" className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-4 ps-12 text-dash-body text-accent outline-none transition-colors focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-accent" />
        <button type="button" onClick={onToggle} aria-label={toggleLabel} className="absolute inset-s-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill text-content-tertiary hover:bg-surface-tertiary hover:text-accent">
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
