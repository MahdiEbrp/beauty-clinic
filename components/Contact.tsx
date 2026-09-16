"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPin, MessageCircle, Navigation, Map, CalendarPlus } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import type { ClinicData } from "@/data/clinic";
import type { PublicLanding } from "@/lib/landing";

interface ContactProps {
  onOpenBooking: () => void;
  clinic?: ClinicData;
  landing?: PublicLanding | null;
}

const socialPill =
  "inline-flex items-center gap-2 px-4 py-2 min-h-11 bg-accent text-content-contrast rounded-pill text-body-sm font-bold hover:bg-accent-hover transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const mapButton =
  "inline-flex min-h-15 flex-1 items-center justify-center gap-3 rounded-pill border border-copper bg-accent px-6 py-3 text-body-sm font-bold text-content-contrast transition-all duration-300 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95";

export default function Contact({ onOpenBooking, clinic, landing }: ContactProps) {
  const locale = useLocale();
  const t = useTranslations();
  const section = landing?.contact;

  const content = clinic?.content;
  const socials = clinic?.social ?? [];
  const address = clinic?.address;
  const maps = clinic?.maps;

  const lat = maps?.coords.lat;
  const lng = maps?.coords.lng;
  const siteName = t("site.name");
  const googleEmbed = `https://maps.google.com/maps?q=${lat},${lng}&z=16&hl=${locale}&output=embed`;
  const googleLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const neshanLink = `https://nshn.ir/?lat=${lat}&lng=${lng}`;

  return (
    <section id="contact" className="relative bg-surface-primary py-24">
      <div className="relative mx-auto max-w-content px-6">
        <div className="mb-16 text-center">
          <h2 className="text-heading-1 text-accent mb-4">
            {section?.heading ?? ""}
          </h2>
          <p className="text-content-secondary">{section?.description ?? ""}</p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center rounded-feature border border-border-primary bg-surface-secondary p-8 shadow-elevation-1 md:p-12">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-primary text-copper">
                <MapPin className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-2 text-body-lg font-bold text-accent">
                  {content?.addressTitle ?? ""}
                </h3>
                <p className="leading-relaxed text-content-secondary">
                  {address?.streetAddress ?? ""}
                </p>
              </div>
            </div>

            {socials.length > 0 && (
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-primary text-copper">
                  <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="mb-3 text-body-lg font-bold text-accent">
                    {content?.socialTitle ?? ""}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.url}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={socialPill}
                      >
                        <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        {social.label}
                        <span className="sr-only"> ({content?.opensInNewTab ?? ""})</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenBooking}
              className="mt-4 inline-flex min-h-15 w-full items-center justify-center gap-3 rounded-pill border border-copper bg-accent px-10 py-5 text-body-lg font-bold text-content-contrast transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
            >
              <CalendarPlus className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              {content?.bookingTitle ?? ""}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div
              role="region"
              aria-label={siteName}
              className="overflow-hidden rounded-feature border border-border-primary bg-surface-secondary shadow-elevation-1"
            >
              <div className="relative aspect-4/3 w-full">
                <iframe
                  title={siteName}
                  src={googleEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
              <div className="flex flex-col gap-3 p-6 sm:flex-row">
                <a
                  href={neshanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={mapButton}
                >
                  <Navigation
                    className="h-5 w-5 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {content?.neshanMap ?? ""}
                  <span className="sr-only"> ({content?.opensInNewTab ?? ""})</span>
                </a>
                <a
                  href={googleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={mapButton}
                >
                  <Map
                    className="h-5 w-5 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {content?.googleMap ?? ""}
                  <span className="sr-only"> ({content?.opensInNewTab ?? ""})</span>
                </a>
              </div>
            </div>
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-panel bg-accent p-8 text-center text-content-contrast shadow-elevation-1">
              <div className="absolute inset-0 bg-linear-to-br from-accent to-accent-hover opacity-90" />
              <div className="relative z-10">
                <BrandLogo alt={t("site.name")} className="mx-auto mb-3 h-10" />
                <h3 className="mb-2 text-xl font-bold text-content-contrast">
                  {content?.clinicName ?? ""}
                </h3>
                <p className="text-body-sm text-content-contrast/80">
                  {address ? `${address.addressLocality}، ${address.addressRegion}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}