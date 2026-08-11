"use client";

import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";

const fieldClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const labelClass =
  "block text-caption font-medium text-content-secondary mb-2";

export default function BookingForm() {
  const t = useTranslations();
  const catalog = usePublicCatalog();
  const serviceOptions = catalog?.groups ?? [];

  return (
    <form
      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <label htmlFor="booking-name" className={labelClass}>
          {t("booking.fullName")}
        </label>
        <input
          type="text"
          id="booking-name"
          name="name"
          autoComplete="name"
          placeholder={t("booking.namePlaceholder")}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="booking-phone" className={labelClass}>
          {t("booking.phone")}
        </label>
        <input
          type="tel"
          id="booking-phone"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder={t("booking.phonePlaceholder")}
          // The value is always Latin digits, so the field itself is LTR while
          // the surrounding form may be RTL. `text-end` keeps the caret at the
          // edge nearest the label without hardcoding left/right.
          dir="ltr"
          className={`${fieldClass} text-end`}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="booking-service" className={labelClass}>
          {t("booking.service")}
        </label>
        <select
          id="booking-service"
          name="service"
          className={fieldClass}
          defaultValue=""
        >
          <option value="" disabled>
            {t("contact.selectService")}
          </option>
          {serviceOptions.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.title}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="booking-msg" className={labelClass}>
          {t("booking.message")}
        </label>
        <textarea
          id="booking-msg"
          name="message"
          rows={3}
          placeholder={t("booking.messagePlaceholder")}
          className={`${fieldClass} resize-none`}
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-body min-h-13 bg-accent text-content-contrast rounded-pill font-bold border border-transparent transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 w-full"
        >
          <span>{t("booking.submit")}</span>
          <CheckCircle className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
