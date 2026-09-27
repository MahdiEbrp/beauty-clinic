"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, AtSign, CreditCard, FileText, Phone, ShieldCheck, User } from "lucide-react";
import { bookingErrorKey } from "@/lib/bookings/errors";
import { asTranslate } from "@/src/i18n/message-key";
import { fetchMyBookings } from "../api";
import type { CartItem, ContactInfo } from "../types";
import type { PublicRule } from "@/lib/services/rules-types";
import { BookingSummary } from "./booking-summary";
import { TermsPanel } from "./terms-panel";
import RulesModal from "./RulesModal";
import PreGatewayModal from "./PreGatewayModal";

type SummaryStepProps = {
  cart: CartItem[];
  rules: PublicRule[];
  onSubmit: (contact: ContactInfo) => Promise<unknown>;
};

type FieldErrors = { fullName?: string; phone?: string; email?: string; terms?: string };

const PHONE_RE = /^0?9\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Step 3 — customer details and terms. */
export default function SummaryStep({ cart, rules, onSubmit }: SummaryStepProps) {
  const t = useTranslations("booking");
  const looseT = asTranslate(t);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showPreGateway, setShowPreGateway] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const cleanPhone = () => phone.trim().replace(/\s+/g, "");

  // Returning customers: prefill the name from their previous bookings.
  const prefetchCustomer = async () => {
    if (fullName.trim()) return;
    try {
      const groups = await fetchMyBookings(cleanPhone());
      const first = groups.find((g) => g.fullName.trim());
      if (first) setFullName(first.fullName.trim());
    } catch {
      // Silent — the field stays empty and the user types it manually.
    }
  };

  const runValidation = (): boolean => {
    const next: FieldErrors = {};
    if (fullName.trim().length < 3) next.fullName = t("summary.errors.name");
    if (!PHONE_RE.test(cleanPhone())) next.phone = t("summary.errors.phone");
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = t("summary.errors.email");
    if (!terms) {
      next.terms = t("summary.errors.terms");
      setShowRules(true);
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!runValidation()) return;
    setFormError(null);
    setShowPreGateway(true);
  };

  const handleConfirmPay = async () => {
    setProcessing(true);
    setFormError(null);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        phone: cleanPhone(),
        email: email.trim() || undefined,
        notes: notes.trim(),
        agreeToTerms: true,
      });
      setShowPreGateway(false);
    } catch (err) {
      setShowPreGateway(false);
      setFormError(looseT(`errors.${bookingErrorKey(err)}`, { fallback: looseT("errors.systemError") }));
    } finally {
      setProcessing(false);
    }
  };

  const accepted = terms && !errors.terms;

  return (
    <form
      className="mx-auto w-full max-w-2xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      {/* Collapsible booking summary */}
      <BookingSummary cart={cart} open={accordionOpen} onToggle={() => setAccordionOpen((open) => !open)} />

      {/* Contact form */}
      <div className="space-y-4 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="summary-name" className="block text-caption font-black text-content-primary">
              {t("summary.fullName")} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4 text-content-tertiary" aria-hidden="true" />
              <input
                id="summary-name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  if (event.target.value.trim()) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder={t("namePlaceholder")}
                className="h-12 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-3 text-body-sm text-content-primary outline-none transition-colors placeholder:text-content-tertiary hover:border-copper focus:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </div>
            {errors.fullName ? (
              <p className="flex items-center gap-1 text-caption font-bold text-error">
                <AlertCircle className="size-3" aria-hidden="true" />
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="summary-phone" className="block text-caption font-black text-content-primary">
              {t("summary.phone")} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4 text-content-tertiary" aria-hidden="true" />
              <input
                id="summary-phone"
                type="tel"
                dir="ltr"
                inputMode="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (event.target.value.trim()) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                onBlur={() => void prefetchCustomer()}
                placeholder={t("phonePlaceholder")}
                className="h-12 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 ps-9 text-end font-mono text-body-sm tracking-wider text-accent outline-none transition-colors placeholder:text-start placeholder:text-content-tertiary hover:border-copper focus:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </div>
            {errors.phone ? (
              <p className="flex items-center gap-1 text-caption font-bold text-error">
                <AlertCircle className="size-3" aria-hidden="true" />
                {errors.phone}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="summary-email" className="block text-caption font-bold text-content-secondary">
            {t("summary.email")}
          </label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4 text-content-tertiary" aria-hidden="true" />
            <input
              id="summary-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (event.target.value.trim()) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder={t("summary.emailPlaceholder")}
              className="h-12 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-3 text-body-sm text-content-primary outline-none transition-colors placeholder:text-content-tertiary hover:border-copper focus:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>
          {errors.email ? (
            <p className="flex items-center gap-1 text-caption font-bold text-error">
              <AlertCircle className="size-3" aria-hidden="true" />
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="summary-notes" className="block text-caption font-bold text-content-secondary">
            {t("summary.notes")}
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4 text-content-tertiary" aria-hidden="true" />
            <input
              id="summary-notes"
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("summary.notesPlaceholder")}
              className="h-12 w-full rounded-control border border-form-input-border bg-form-input-bg ps-9 pe-3 text-body-sm text-content-primary outline-none transition-colors placeholder:text-content-tertiary hover:border-copper focus:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>
        </div>

        {/* Terms & rules */}
        <TermsPanel
          rules={rules}
          accepted={accepted}
          error={errors.terms}
          onChange={(checked) => {
            setTerms(checked);
            if (checked) setErrors((prev) => ({ ...prev, terms: undefined }));
          }}
          onReadRules={() => setShowRules(true)}
        />

        {formError ? (
          <p role="alert" className="flex items-start gap-2 rounded-control border border-error/40 bg-error/5 px-4 py-3 text-body-sm font-bold text-error">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        ) : null}

        <div className="space-y-2 pt-1">
          <button
            type="submit"
            className="inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 text-body font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent select-none"
          >
            <CreditCard className="size-4 text-copper-light" aria-hidden="true" />
            {t("summary.payDepositButton")}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-caption text-content-tertiary">
            <ShieldCheck className="size-3.5 text-copper" aria-hidden="true" />
            {t("summary.guarantee")}
          </p>
        </div>
      </div>

      {showRules ? (
        <RulesModal
          rules={rules}
          onAccept={() => {
            setTerms(true);
            setErrors((prev) => ({ ...prev, terms: undefined }));
            setShowRules(false);
          }}
          onClose={() => setShowRules(false)}
        />
      ) : null}

      {showPreGateway ? (
        <PreGatewayModal
          fullName={fullName.trim()}
          phone={cleanPhone()}
          cart={cart}
          rules={rules}
          processing={processing}
          onConfirm={() => void handleConfirmPay()}
          onClose={() => {
            if (!processing) setShowPreGateway(false);
          }}
        />
      ) : null}
    </form>
  );
}