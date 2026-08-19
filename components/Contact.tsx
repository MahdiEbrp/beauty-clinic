"use client";

import { useTranslations } from "next-intl";
import {
  MapPin,
  MessageCircle,
  Navigation,
  Map,
  CalendarPlus,
} from "lucide-react";
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

const mapTile =
  "bg-surface-secondary border border-border-interactive rounded-panel p-6 flex flex-col items-center justify-center text-center hover:bg-surface-tertiary transition-all group shadow-elevation-1 aspect-square focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const DEFAULT_SOCIAL = {
  rubika: "https://rubika.ir/nafasclinic",
  bale: "https://ble.ir/nafasclinic",
  instagram: "https://instagram.com/nafasclinic",
} as const;

const DEFAULT_MAPS = {
  neshan: "https://nshn.ir/rbvg0k2xLMq4",
  // eslint-disable-next-line no-secrets/no-secrets -- public Google Maps search URL, not a secret
  google: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2",
} as const;

export default function Contact({ onOpenBooking, clinic, landing }: ContactProps) {
  const t = useTranslations();
  const section = landing?.contact;

  const socials = [
    { key: "rubika", href: clinic?.social.rubika ?? DEFAULT_SOCIAL.rubika },
    { key: "bale", href: clinic?.social.bale ?? DEFAULT_SOCIAL.bale },
    { key: "instagram", href: clinic?.social.instagram ?? DEFAULT_SOCIAL.instagram },
  ] as const;

  return (
    <section id="contact" className="py-24 relative bg-surface-primary">
      <div className="relative max-w-content mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-heading-1 text-accent mb-4">
            {section?.heading ?? `${t("contact.heading1")} ${t("contact.heading2")}`}
          </h2>
          <p className="text-content-secondary">
            {section?.description ?? t("contact.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-surface-secondary border border-border-primary rounded-feature p-8 md:p-12 flex flex-col justify-center shadow-elevation-1">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-surface-primary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
                <MapPin className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-accent mb-2">
                  {t("contact.addressTitle")}
                </h3>
                <p className="text-content-secondary leading-relaxed">
                  {t("contact.address")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-surface-primary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
                <MessageCircle
                  className="w-6 h-6"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-accent mb-3">
                  {t("contact.socialTitle")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={socialPill}
                    >
                      <MessageCircle
                        className="w-4 h-4"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {t(`contact.${social.key}`)}
                      <span className="sr-only">
                        {" "}
                        ({t("contact.opensInNewTab")})
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-accent text-content-contrast rounded-pill font-bold border border-copper transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 w-full mt-4"
            >
              <CalendarPlus className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
              {t("contact.bookingTitle")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a
              href={clinic?.maps.neshan ?? DEFAULT_MAPS.neshan}
              target="_blank"
              rel="noopener noreferrer"
              className={mapTile}
            >
              <Navigation
                className="w-12 h-12 text-copper mb-4 group-hover:scale-110 transition-transform"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="text-accent font-bold mb-2 text-body-lg">
                {t("contact.neshanMap")}
              </h3>
              <p className="text-xs text-content-secondary">
                {t("contact.neshanDesc")}
              </p>
            </a>
            <a
              href={clinic?.maps.google ?? DEFAULT_MAPS.google}
              target="_blank"
              rel="noopener noreferrer"
              className={mapTile}
            >
              <Map
                className="w-12 h-12 text-copper mb-4 group-hover:scale-110 transition-transform"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="text-accent font-bold mb-2 text-body-lg">
                {t("contact.googleMap")}
              </h3>
              <p className="text-xs text-content-secondary">
                {t("contact.googleMapDesc")}
              </p>
            </a>
            <div className="col-span-2 bg-accent text-content-contrast rounded-panel p-8 flex flex-col items-center justify-center text-center shadow-elevation-1 aspect-video relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-accent to-accent-hover opacity-90" />
              <div className="relative z-10">
                <BrandLogo
                  alt={t("site.name")}
                  className="h-10 mx-auto mb-3"
                />
                <h3 className="text-content-contrast font-bold text-xl mb-2">
                  {t("contact.clinicName")}
                </h3>
                <p className="text-content-contrast/80 text-body-sm">
                  {t("contact.clinicAddress")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
