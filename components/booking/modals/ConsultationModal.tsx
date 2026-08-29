"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MessageSquare, Phone, Send, ShieldCheck, Stethoscope, UserCheck, X } from "lucide-react";

type Props = {
  onClose: () => void;
  telephone: string | null;
  phoneDisplay: string;
};

/** Free expert consultation request modal (Template parity), tokenized. */
export default function ConsultationModal({ onClose, telephone, phoneDisplay }: Props) {
  const t = useTranslations("booking");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!phone) return;
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("consultModal.title")}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-panel border-2 border-copper bg-surface-secondary shadow-elevation-4 animate-zoom-in">
        <div className="flex shrink-0 items-center justify-between gap-3 bg-linear-to-r from-accent to-primary-deep p-4 text-content-contrast sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-panel bg-copper text-content-contrast shadow-elevation-1">
              <Stethoscope className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-black sm:text-lg">{t("consultModal.title")}</h3>
              <p className="mt-0.5 text-xs text-copper-light">{t("consultModal.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label={t("consultModal.close")}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4 text-xs sm:p-6 sm:text-sm">
          {submitted ? (
            <div className="space-y-3 rounded-panel border border-border-interactive bg-surface-primary p-6 py-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-panel border border-copper/40 bg-surface-tertiary text-accent">
                <CheckCircle2 className="size-8 text-copper" aria-hidden="true" />
              </div>
              <h4 className="text-base font-extrabold text-content-primary">{t("consultModal.successTitle")}</h4>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-content-secondary">
                {t("consultModal.successDesc", { phone })}
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-control bg-accent px-6 py-2.5 text-xs font-bold text-content-contrast shadow-elevation-1"
                >
                  {t("consultModal.back")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Instant phone call */}
              <div className="flex flex-col justify-between gap-3 rounded-panel border border-border-interactive bg-surface-primary p-3.5 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-black text-content-primary">
                    <Phone className="size-4 text-copper" aria-hidden="true" />
                    {t("consultModal.instantTitle")}
                  </div>
                  <p className="text-[11px] text-content-secondary">{t("consultModal.instantSub")}</p>
                </div>
                {telephone ? (
                  <a
                    href={`tel:${telephone}`}
                    className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 py-2 text-xs font-extrabold text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover"
                  >
                    <Phone className="size-3.5 text-copper-light" aria-hidden="true" />
                    <span dir="ltr">{phoneDisplay}</span>
                  </a>
                ) : null}
              </div>

              {/* Callback form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="space-y-3 rounded-panel border border-border-primary bg-surface-primary p-4"
              >
                <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-content-primary">
                  <MessageSquare className="size-4 text-copper" aria-hidden="true" />
                  {t("consultModal.formTitle")}
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-content-secondary">{t("consultModal.name")}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("consultModal.namePlaceholder")}
                    className="w-full rounded-control border border-border-interactive bg-surface-secondary px-3 py-2 text-xs text-content-primary outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-content-secondary">{t("consultModal.phone")}</span>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full rounded-control border border-border-interactive bg-surface-secondary px-3 py-2 text-xs text-content-primary outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-content-secondary">{t("consultModal.concern")}</span>
                  <textarea
                    rows={2}
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    className="w-full resize-none rounded-control border border-border-interactive bg-surface-secondary px-3 py-2 text-xs text-content-primary outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />
                </label>

                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 py-2.5 text-xs font-extrabold text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98]"
                >
                  <Send className="size-3.5" aria-hidden="true" />
                  {t("consultModal.submit")}
                </button>
              </form>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-content-secondary">
                <div className="flex items-center gap-1.5 rounded-control border border-border-primary bg-surface-primary p-2">
                  <ShieldCheck className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                  {t("consultModal.free")}
                </div>
                <div className="flex items-center gap-1.5 rounded-control border border-border-primary bg-surface-primary p-2">
                  <UserCheck className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                  {t("consultModal.licensed")}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
