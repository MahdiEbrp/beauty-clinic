"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  FileText,
  LoaderCircle,
  Mail,
  Phone,
  ShieldAlert,
  Stethoscope,
  User,
} from "lucide-react";
import { bookingErrorKey } from "@/lib/bookings/errors";
import { cn } from "@/lib/utils";
import { asTranslate } from "@/src/i18n/message-key";
import { Switch } from "../Switch";
import type { ContactInfo } from "../types";

type ContactStepProps = {
  defaultValues: ContactInfo;
  onBack: () => void;
  onContinue: (data: ContactInfo) => Promise<unknown>;
};

const fieldClass =
  "w-full rounded-control border border-form-input-border bg-form-input-bg py-3 ps-10 pe-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function schema(t: (key: string) => string) {
  return z.object({
    fullName: z.string().trim().min(2, t("contact.errors.name")).max(160),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+][0-9\s()-]{6,19}$/, t("contact.errors.phone"))
      .max(24),
    email: z.union([z.literal(""), z.email().trim().max(254)]),
    notes: z.string().trim().max(1000),
    consultationRequired: z.boolean(),
    hasAllergies: z.boolean(),
    isPregnant: z.boolean(),
    agreeToTerms: z.boolean().refine((v) => v, t("contact.errors.terms")),
  });
}

/** Step 3 — contact (Template Step3 parity): header card, icon-prefixed inputs
 *  and switch-style consent/medical toggle bars. */
export default function ContactStep({ defaultValues, onBack, onContinue }: ContactStepProps) {
  const t = useTranslations("booking");
  const looseT = asTranslate(t);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactInfo>({
    resolver: zodResolver(schema(looseT)),
    defaultValues,
  });

  const [consultationRequired, hasAllergies, isPregnant, agreeToTerms] = useMemo(
    () => watch([
      "consultationRequired",
      "hasAllergies",
      "isPregnant",
      "agreeToTerms",
    ]),
    [],
  );

  const setToggle = (name: "consultationRequired" | "hasAllergies" | "isPregnant" | "agreeToTerms", value: boolean) =>
    setValue(name, value, { shouldValidate: true });

  const onSubmit = async (data: ContactInfo) => {
    setSubmitting(true);
    setError(null);
    try {
      await onContinue(data);
    } catch (err) {
      setError(looseT(`errors.${bookingErrorKey(err)}`));
    } finally {
      setSubmitting(false);
    }
  };

  const iconWrap = "pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3.5 text-content-tertiary";

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      noValidate
      className="w-full max-w-4xl space-y-4"
    >
      {/* Header card */}
      <div className="flex flex-col justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary p-3.5 shadow-elevation-1 sm:flex-row sm:items-center sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-black text-content-contrast">
              {t("confirmStep")}
            </span>
            <h2 className="text-xl font-black tracking-tight text-content-primary">{t("contact.title")}</h2>
          </div>
          <p className="mt-1 text-sm text-content-secondary">{t("contact.subtitle")}</p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 self-start rounded-control border border-border-interactive bg-surface-primary px-3 py-1.5 text-xs font-bold text-content-primary shadow-elevation-1 transition-all hover:bg-surface-tertiary sm:self-center"
        >
          <ArrowRight className="size-3.5 rtl-mirror" aria-hidden="true" />
          {t("contact.backSchedule")}
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-4 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="booking-name" className="block text-sm font-extrabold text-content-primary">
              {t("contact.fullName")}
            </label>
            <div className="relative">
              <div className={iconWrap}>
                <User className="size-4" aria-hidden="true" />
              </div>
              <input
                id="booking-name"
                type="text"
                autoComplete="name"
                className={fieldClass}
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
            </div>
            {errors.fullName ? (
              <p role="alert" className="text-[11px] font-bold text-error">
                {errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="booking-phone" className="block text-sm font-extrabold text-content-primary">
              {t("contact.phone")}
            </label>
            <div className="relative">
              <div className={iconWrap}>
                <Phone className="size-4" aria-hidden="true" />
              </div>
              <input
                id="booking-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                className={cn(fieldClass, "font-bold tracking-wider")}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
            </div>
            {errors.phone ? (
              <p role="alert" className="text-[11px] font-bold text-error">
                {errors.phone.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="booking-email" className="block text-sm font-bold text-content-primary">
            {t("contact.email")}{" "}
            <span aria-hidden="true" className="text-content-tertiary">
              · {t("contact.emailOptional")}
            </span>
          </label>
          <div className="relative">
            <div className={iconWrap}>
              <Mail className="size-4" aria-hidden="true" />
            </div>
            <input
              id="booking-email"
              type="email"
              autoComplete="email"
              dir="ltr"
              className={fieldClass}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p role="alert" className="text-[11px] font-bold text-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        {/* Doctor consultation toggle bar */}
        <div className="flex items-center justify-between gap-3 rounded-control border border-border-interactive bg-surface-primary p-3.5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-secondary text-copper">
              <Stethoscope className="size-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-content-primary">{t("contact.consultation")}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-content-secondary">{t("contact.consultationHint")}</p>
            </div>
          </div>
          <Switch checked={consultationRequired} onCheckedChange={(v) => setToggle("consultationRequired", v)} aria-label={t("contact.consultation")} />
        </div>

        {/* Medical toggles */}
        <div className="space-y-2.5 border-t border-border-primary pt-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-content-primary">
            <ShieldAlert className="size-4 text-copper" aria-hidden="true" />
            {t("contact.healthTitle")}
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
            <div className="flex items-center justify-between gap-2.5 rounded-control border border-border-primary bg-surface-primary p-3">
              <span className="font-medium leading-snug text-content-primary">{t("contact.allergies")}</span>
              <Switch size="sm" checked={hasAllergies} onCheckedChange={(v) => setToggle("hasAllergies", v)} aria-label={t("contact.allergies")} />
            </div>
            <div className="flex items-center justify-between gap-2.5 rounded-control border border-border-primary bg-surface-primary p-3">
              <span className="font-medium leading-snug text-content-primary">{t("contact.pregnant")}</span>
              <Switch size="sm" checked={isPregnant} onCheckedChange={(v) => setToggle("isPregnant", v)} aria-label={t("contact.pregnant")} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label htmlFor="booking-notes" className="block text-sm font-bold text-content-primary">
            {t("contact.notes")}{" "}
            <span aria-hidden="true" className="text-content-tertiary">
              · {t("contact.notesOptional")}
            </span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-s-3.5 top-3 text-content-tertiary">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <textarea
              id="booking-notes"
              rows={2}
              className="w-full resize-none rounded-control border border-border-primary bg-form-input-bg py-2.5 ps-10 pe-3.5 text-sm text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              {...register("notes")}
            />
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-border-primary pt-3">
          <div className="flex items-start justify-between gap-3 rounded-control border border-border-interactive bg-surface-primary p-3">
            <div className="text-xs leading-relaxed text-content-secondary">
              <span className="mb-0.5 block font-bold text-content-primary">{t("contact.terms")}</span>
              {t("contact.termsHint")}
            </div>
            <Switch checked={agreeToTerms} onCheckedChange={(v) => setToggle("agreeToTerms", v)} aria-label={t("contact.terms")} />
          </div>
          {errors.agreeToTerms ? (
            <p role="alert" className="mt-1.5 text-xs font-bold text-error">
              {errors.agreeToTerms.message}
            </p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="rounded-control border border-error/40 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary px-8 text-body font-bold text-content-secondary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("contact.back")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill border border-copper bg-accent px-8 text-body font-bold text-content-contrast transition-all duration-300 hover:bg-accent-hover hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
            {t("contact.submit")}
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="h-14 sm:h-20 lg:hidden" />
    </form>
  );
}
