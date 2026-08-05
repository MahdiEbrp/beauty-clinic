"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { changePasswordSchema } from "@/lib/validation/user";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ChangePasswordDialog({ user, onOpenChange, onSuccess, onError }: { user: { id: string; fullName: string } | null; onOpenChange: (open: boolean) => void; onSuccess: () => Promise<void>; onError: (message: string) => void }) {
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strength = useMemo(() => [password.length >= 8, /[0-9]/.test(password), /[A-Z]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length, [password]);

  const close = (open: boolean) => {
    if (open) return onOpenChange(true);
    setPassword(""); setConfirmPassword(""); setError(null); onOpenChange(false);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const parsed = changePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) { setError(t("users.form.errors.password")); return; }
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/v1/users/${user.id}/password`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(parsed.data) });
      if (!response.ok) throw new Error("failed");
      await onSuccess();
      close(false);
    } catch { onError(t("users.errors.create")); close(false); } finally { setPending(false); }
  };

  return <Dialog open={user !== null} onOpenChange={close}>
    <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-md">
      <DialogHeader><DialogTitle className="text-accent">{t("users.changePassword.title")}</DialogTitle><DialogDescription>{user && t("users.changePassword.description", { name: user.fullName })}</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="grid gap-4">
        <PasswordField id="change-password" value={password} onChange={setPassword} visible={visible} toggle={() => setVisible((value) => !value)} label={t("users.changePassword.newPassword")} toggleLabel={t("users.form.showPassword")} />
        <PasswordField id="change-password-confirm" value={confirmPassword} onChange={setConfirmPassword} visible={visible} toggle={() => setVisible((value) => !value)} label={t("users.changePassword.confirmPassword")} toggleLabel={t("users.form.showPassword")} />
        <div className="flex h-1.5 gap-1 rounded-pill bg-surface-tertiary">{[0, 1, 2, 3].map((index) => <span key={index} className={`flex-1 rounded-pill ${index < strength ? strength < 2 ? "bg-error" : strength < 4 ? "bg-copper" : "bg-success" : "bg-transparent"}`} />)}</div>
        {error && <p role="alert" className="rounded-control border border-error/30 bg-error/10 p-3 text-body-sm text-error">{error}</p>}
        <DialogFooter className="mt-2"><DialogClose type="button" className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-body-sm font-bold text-accent">{t("users.dialog.cancel")}</DialogClose><button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-body-sm font-bold text-content-contrast disabled:opacity-50">{pending && <Loader2 className="size-4 animate-spin" />}{t("users.changePassword.submit")}</button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function PasswordField({ id, value, onChange, visible, toggle, label, toggleLabel }: { id: string; value: string; onChange: (value: string) => void; visible: boolean; toggle: () => void; label: string; toggleLabel: string }) {
  return <label htmlFor={id} className="grid gap-1.5 text-caption font-bold text-content-secondary"><span>{label}</span><span className="relative"><input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} dir="ltr" className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-4 ps-12 text-body text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-accent" /><button type="button" onClick={toggle} aria-label={toggleLabel} className="absolute inset-s-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill text-content-tertiary hover:bg-surface-tertiary">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>;
}
