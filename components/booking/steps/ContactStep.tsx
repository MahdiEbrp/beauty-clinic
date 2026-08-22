"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { bookingErrorKey } from "@/lib/bookings/errors";
import { cn } from "@/lib/utils";
import type { ContactInfo } from "../types";

type ContactStepProps = {
  defaultValues: ContactInfo;
  onContinue: (data: ContactInfo) => Promise<void>;
};

const fieldClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const labelClass = "block text-caption font-medium text-content-secondary mb-2";

function schema(t: (key: string, values?: Record<string, string | number | Date>) => string) {
  return z.object({
    fullName: z.string().trim().min(2, t("contact.errors.name")).max(160),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+][0-9\s()-]{6,19}$/, t("contact.errors.phone"))
      .max(24),
    email: z.union([z.literal(""), z.email().trim().max(254)]),
    notes: z.string().trim().max(1000),
  });
}

export default function ContactStep({ defaultValues, onContinue }: ContactStepProps) {
  const t = useTranslations("booking");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInfo>({
    resolver: zodResolver(schema(t)),
    defaultValues,
  });

  const onSubmit = async (data: ContactInfo) => {
    setSubmitting(true);
    setError(null);
    try {
      await onContinue({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
      });
    } catch (err) {
      setError(t(`errors.${bookingErrorKey(err)}`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      noValidate
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="booking-name" className={labelClass}>
          {t("contact.fullName")}
        </label>
        <input
          id="booking-name"
          type="text"
          autoComplete="name"
          className={fieldClass}
          aria-invalid={Boolean(errors.fullName)}
          {...register("fullName")}
        />
        {errors.fullName ? (
          <p role="alert" className="mt-2 text-caption text-error">
            {errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="booking-phone" className={labelClass}>
          {t("contact.phone")}
        </label>
        <input
          id="booking-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          className={cn(fieldClass, "text-end")}
          aria-invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
        {errors.phone ? (
          <p role="alert" className="mt-2 text-caption text-error">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="booking-email" className={labelClass}>
          {t("contact.email")} <span aria-hidden="true" className="text-content-tertiary">· {t("contact.emailOptional")}</span>
        </label>
        <input
          id="booking-email"
          type="email"
          autoComplete="email"
          dir="ltr"
          className={cn(fieldClass, "text-end")}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p role="alert" className="mt-2 text-caption text-error">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="booking-notes" className={labelClass}>
          {t("contact.notes")} <span aria-hidden="true" className="text-content-tertiary">· {t("contact.notesOptional")}</span>
        </label>
        <textarea
          id="booking-notes"
          rows={3}
          className={cn(fieldClass, "resize-none")}
          {...register("notes")}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-control border border-error/40 bg-error/5 px-4 py-3 text-body-sm text-error sm:col-span-2">
          {error}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-pill border border-copper bg-accent px-8 text-body-lg font-bold text-content-contrast transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {submitting ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : null}
          {t("contact.submit")}
        </button>
      </div>
    </form>
  );
}
