import "server-only";

import { loadSocialLinksDataset, loadSystemSettingsDataset } from "@/lib/settings/loader";
import {
  DEFAULT_CLINIC_TIMEZONE,
  loadWorkingHours,
  type WorkingHoursGroup,
} from "@/lib/bookings/working-hours";
import type { Locale } from "@/lib/services/types";

export type SocialLinkData = {
  url: string;
  imageUrl: string | null;
  label: string;
};

export type ClinicContent = {
  clinicName: string;
  addressTitle: string;
  socialTitle: string;
  bookingTitle: string;
  neshanMap: string;
  neshanDesc: string;
  googleMap: string;
  googleMapDesc: string;
  selectService: string;
  opensInNewTab: string;
};

export type ClinicData = {
  telephone: string | null;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  openingHours: readonly WorkingHoursGroup[];
  timezone: string;
  social: SocialLinkData[];
  maps: {
    neshan: string;
    google: string;
    coords: { lat: number; lng: number };
  };
  currency: string;
  minCancelHours: number;
  defaultDeposit: number;
  content: ClinicContent;
};

const DEFAULT_CONTENT: ClinicContent = {
  clinicName: "کلینیک زیبایی نفس",
  addressTitle: "آدرس کلینیک",
  socialTitle: "شبکه‌های اجتماعی",
  bookingTitle: "رزرو آنلاین",
  neshanMap: "مشاهده روی نقشه نشان",
  neshanDesc: "مسیریابی با نشان",
  googleMap: "مشاهده روی نقشه گوگل",
  googleMapDesc: "مسیریابی با گوگل‌مپ",
  selectService: "انتخاب خدمت...",
  opensInNewTab: "در تب جدید باز می‌شود",
};

const DEFAULT_CLINIC: Omit<ClinicData, "content"> = {
  telephone: null,
  address: {
    streetAddress:
      "اندیشه فاز دو - میدان مادر - ابتدای بلوار نیلوفر نبش بنفشه هفتم - پلاک ۳۹ - طبقه دو",
    addressLocality: "اندیشه",
    addressRegion: "تهران",
    addressCountry: "IR",
  },
  openingHours: [
    {
      days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
      opens: "09:00",
      closes: "19:00",
      capacity: 1,
    },
    { days: ["Thursday"], opens: "09:00", closes: "14:00", capacity: 1 },
  ],
  timezone: DEFAULT_CLINIC_TIMEZONE,
  social: [
    { url: "https://rubika.ir/nafasclinic", imageUrl: null, label: "روبیکا" },
    { url: "https://ble.ir/nafasclinic", imageUrl: null, label: "بله" },
    { url: "https://instagram.com/nafasclinic", imageUrl: null, label: "اینستاگرام" },
  ],
  maps: {
    neshan: "https://nshn.ir/rbvg0k2xLMq4",
    // eslint-disable-next-line no-secrets/no-secrets -- public Google Maps search URL, not a secret
    google: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2",
    coords: { lat: 35.696215, lng: 51.0030191 },
  },
  currency: "تومان",
  minCancelHours: 24,
  defaultDeposit: 100000,
};

function localized(
  translations: { fa?: unknown; en?: unknown } | undefined,
  fallback: unknown,
  locale: Locale,
): unknown {
  const value = translations?.[locale];
  return value === undefined ? fallback : value;
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function numberSetting(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Resolves the clinic-wide public data from cached system settings + social links. */
export async function getClinicData(locale: Locale): Promise<ClinicData> {
  const [settingsRows, socialRows, openingHours] = await Promise.all([
    loadSystemSettingsDataset(),
    loadSocialLinksDataset(),
    loadWorkingHours(),
  ]);

  const byKey = new Map(settingsRows.map((row) => [row.key, row]));

  const s = (key: string, fallback: string) => {
    const row = byKey.get(key);
    return text(localized(row?.translations, row?.value, locale), fallback);
  };

  const timezoneSetting = byKey.get("booking.timezone")?.value;
  const timezone = typeof timezoneSetting === "string" && timezoneSetting.trim() ? timezoneSetting : DEFAULT_CLINIC_TIMEZONE;

  const social = socialRows
    .filter((row) => row.isActive)
    .map((row) => ({
      url: row.url,
      imageUrl: row.imageUrl,
      label: row.labels[locale] ?? row.labels.fa ?? row.url,
    }));

  return {
    telephone: s("contact.phone", "") || null,
    address: {
      streetAddress: s("contact.address_full", DEFAULT_CLINIC.address.streetAddress),
      addressLocality: s("contact.city", DEFAULT_CLINIC.address.addressLocality),
      addressRegion: s("contact.province", DEFAULT_CLINIC.address.addressRegion),
      addressCountry: s("contact.country", DEFAULT_CLINIC.address.addressCountry),
    },
    openingHours,
    timezone,
    social,
    maps: {
      neshan: s("contact.map_neshan", DEFAULT_CLINIC.maps.neshan),
      google: s("contact.map_google", DEFAULT_CLINIC.maps.google),
      coords: {
        lat: numberSetting(byKey.get("contact.map_lat")?.value, DEFAULT_CLINIC.maps.coords.lat),
        lng: numberSetting(byKey.get("contact.map_lng")?.value, DEFAULT_CLINIC.maps.coords.lng),
      },
    },
    currency: s("booking.currency", DEFAULT_CLINIC.currency),
    minCancelHours: numberSetting(byKey.get("booking.min_cancel_hours")?.value, 24),
    defaultDeposit: numberSetting(byKey.get("booking.price")?.value, 100000),
    content: {
      clinicName: s("clinic.name", DEFAULT_CONTENT.clinicName),
      addressTitle: s("contact.address_title", DEFAULT_CONTENT.addressTitle),
      socialTitle: s("contact.social_title", DEFAULT_CONTENT.socialTitle),
      bookingTitle: s("contact.booking_title", DEFAULT_CONTENT.bookingTitle),
      neshanMap: s("contact.neshan_map", DEFAULT_CONTENT.neshanMap),
      neshanDesc: s("contact.neshan_desc", DEFAULT_CONTENT.neshanDesc),
      googleMap: s("contact.google_map", DEFAULT_CONTENT.googleMap),
      googleMapDesc: s("contact.google_desc", DEFAULT_CONTENT.googleMapDesc),
      selectService: s("booking.select_service", DEFAULT_CONTENT.selectService),
      opensInNewTab: s("common.opens_in_new_tab", DEFAULT_CONTENT.opensInNewTab),
    },
  };
}