"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { EMAIL_API_ROUTES, EMAIL_LIMITS } from "@/lib/email/constants";
import type { AdminEmailProvider } from "@/lib/email/provider-service";
import { inputClass } from "@/components/create-group/ui";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EmailProviderTestDialog({
  provider,
  open,
  onOpenChange,
}: {
  provider: AdminEmailProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("emailAdmin");
  const sendT = useTranslations("emailSend");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!provider) return null;
  const targetProvider = provider;

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(
        `${EMAIL_API_ROUTES.providers}/${targetProvider.id}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipient, subject, message }),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? t("connection.testError"));
      }
      toast.success(t("connection.testSuccess"));
      setRecipient("");
      setSubject("");
      setMessage("");
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("connection.testError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent closeLabel={t("actions.cancel")}>
        <form onSubmit={(event) => void submit(event)} className="space-y-5">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("connection.testTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{targetProvider.name}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="email-test-recipient">
              {t("connection.testRecipient")}
              <input
                id="email-test-recipient"
                dir="ltr"
                type="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder={t("connection.testPlaceholder")}
                className={inputClass(Boolean(error) || !recipient)}
                maxLength={EMAIL_LIMITS.recipientMaxLength}
                required
              />
            </label>
            <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="email-test-subject">
              {sendT("fields.subject")}
              <input
                id="email-test-subject"
                dir="ltr"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={inputClass(Boolean(error) || !subject)}
                maxLength={EMAIL_LIMITS.subjectMaxLength}
                required
              />
            </label>
            <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="email-test-message">
              {t("connection.testMessage")}
              <textarea
                id="email-test-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("connection.testMessagePlaceholder")}
                className={`${inputClass(Boolean(error) || !message)} min-h-28 resize-y py-3`}
                maxLength={EMAIL_LIMITS.messageMaxLength}
                required
              />
            </label>
          </div>
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-control border border-error/30 bg-error/10 p-3 text-dash-caption text-error">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="wrap-break-word">{error}</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{t("actions.cancel")}</AlertDialogCancel>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-body-sm font-bold text-content-contrast transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )}
              {submitting ? t("connection.testing") : t("actions.test")}
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}