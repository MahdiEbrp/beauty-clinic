"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Check, Clock, Copy, MapPin, Navigation, Phone, X } from "lucide-react";

type OpeningSlot = { days: readonly string[]; opens: string; closes: string };

type Props = {
  onClose: () => void;
  clinicName: string;
  addressTitle: string;
  address: string;
  openingHours: readonly OpeningSlot[];
  telephone: string | null;
  phoneDisplay: string;
  neshanMap: string;
  googleMap: string;
};

/** Clinic address / hours / directions modal (Template parity), tokenized. */
export default function ClinicInfoModal({
  onClose,
  clinicName,
  addressTitle,
  address,
  openingHours,
  telephone,
  phoneDisplay,
  neshanMap,
  googleMap,
}: Props) {
  const t = useTranslations("booking");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const week = openingHours.find((h) => h.days.includes("Saturday")) ?? null;
  const thu = openingHours.find((h) => h.days.includes("Thursday")) ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={clinicName}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-panel border-2 border-copper bg-surface-secondary shadow-elevation-4 animate-zoom-in">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-primary bg-surface-primary p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-control bg-accent text-content-contrast shadow-elevation-1">
              <Building2 className="size-5 text-copper" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-black text-content-primary sm:text-lg">{clinicName}</h3>
              <p className="text-xs text-content-secondary">{t("clinicModal.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-content-tertiary transition-colors hover:bg-surface-tertiary hover:text-content-primary"
            aria-label={t("clinicModal.close")}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
          {/* Address */}
          <div className="space-y-2 rounded-panel border border-border-interactive bg-surface-primary p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-copper-strong">
                <MapPin className="size-4 text-copper" aria-hidden="true" />
                {addressTitle}
              </span>
              <button
                type="button"
                onClick={() => void copy()}
                className="flex cursor-pointer items-center gap-1 text-xs font-bold text-accent hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-copper" aria-hidden="true" />
                    <span className="font-extrabold text-copper-deep">{t("clinicModal.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" aria-hidden="true" />
                    {t("clinicModal.copy")}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-bold leading-relaxed text-content-primary sm:text-sm">{address}</p>
          </div>

          {/* Hours */}
          <div className="space-y-2.5 rounded-panel border border-border-primary bg-surface-primary p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-content-primary">
              <Clock className="size-4 text-copper" aria-hidden="true" />
              {t("clinicModal.hoursTitle")}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-control border border-border-primary bg-surface-secondary p-2.5">
                <span className="font-bold text-content-primary">{t("clinicModal.satWed")}</span>
                <span className="font-black text-copper-deep" dir="ltr">
                  {week ? `${week.opens} - ${week.closes}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-control border border-border-primary bg-surface-secondary p-2.5">
                <span className="font-bold text-content-primary">{t("clinicModal.thu")}</span>
                <span className="font-black text-copper-deep" dir="ltr">
                  {thu ? `${thu.opens} - ${thu.closes}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-control border border-border-primary bg-surface-secondary p-2.5 opacity-80">
                <span className="font-bold text-content-secondary">{t("clinicModal.fri")}</span>
                <span className="font-bold text-red-700">{t("clinicModal.closed")}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-content-primary">{t("clinicModal.navTitle")}</div>
            <div className="grid grid-cols-2 gap-2">
              {googleMap ? (
                <a
                  href={googleMap}
                  target="_blank"
                  rel="noreferrer"
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary p-2.5 text-xs font-bold text-content-primary transition-colors hover:bg-surface-tertiary"
                >
                  <Navigation className="size-3.5 text-copper" aria-hidden="true" />
                  {t("clinicModal.google")}
                </a>
              ) : null}
              {neshanMap ? (
                <a
                  href={neshanMap}
                  target="_blank"
                  rel="noreferrer"
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary p-2.5 text-xs font-bold text-content-primary transition-colors hover:bg-surface-tertiary"
                >
                  <Navigation className="size-3.5 text-blue-600" aria-hidden="true" />
                  {t("clinicModal.neshan")}
                </a>
              ) : null}
            </div>
          </div>

          {/* Phone CTA */}
          {telephone ? (
            <div className="flex items-center justify-between gap-2 rounded-panel bg-accent p-3.5 text-content-contrast">
              <div>
                <div className="text-sm font-black">{t("clinicModal.callTitle")}</div>
                <div className="mt-0.5 text-[11px] text-gold">{t("clinicModal.callSub")}</div>
              </div>
              <a
                href={`tel:${telephone}`}
                className="flex cursor-pointer items-center gap-1.5 rounded-control bg-gold px-3 py-1.5 text-xs font-black text-primary-deep transition-transform hover:scale-105"
              >
                <Phone className="size-3.5" aria-hidden="true" />
                <span dir="ltr">{phoneDisplay}</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
