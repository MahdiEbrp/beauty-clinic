import "server-only";

import { loadSystemSettingsMap } from "@/lib/settings/loader";

export type ClinicData = {
  telephone: string | null;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  openingHours: readonly {
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
  }[];
  social: {
    rubika: string;
    bale: string;
    instagram: string;
  };
  maps: {
    neshan: string;
    google: string;
  };
};

const DEFAULT_CLINIC: ClinicData = {
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
    },
    { days: ["Thursday"], opens: "09:00", closes: "14:00" },
  ],
  social: {
    rubika: "https://rubika.ir/nafasclinic",
    bale: "https://ble.ir/nafasclinic",
    instagram: "https://instagram.com/nafasclinic",
  },
  maps: {
    neshan: "https://nshn.ir/rbvg0k2xLMq4",
    // eslint-disable-next-line no-secrets/no-secrets -- public Google Maps search URL, not a secret
    google: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2",
  },
};

type OpeningSlot = {
  days: string[];
  opens: string;
  closes: string;
};

function isOpeningSlot(value: unknown): value is OpeningSlot {
  if (typeof value !== "object" || value === null) return false;
  const slot = value as Record<string, unknown>;
  return (
    Array.isArray(slot.days) &&
    slot.days.every((day) => typeof day === "string") &&
    typeof slot.opens === "string" &&
    typeof slot.closes === "string"
  );
}

export async function getClinicData(): Promise<ClinicData> {
  const settings = await loadSystemSettingsMap();

  const s = (key: string, fallback: string) =>
    typeof settings.get(key) === "string" ? (settings.get(key) as string) : fallback;

  // Opening hours are editable via the `clinic.opening_hours` system setting
  // (a JSON array of day-range slots); a malformed or missing value falls back
  // to the compiled defaults so the site never renders broken hours.
  const openingHoursSetting = settings.get("clinic.opening_hours");
  const openingHours =
    Array.isArray(openingHoursSetting) &&
    openingHoursSetting.length > 0 &&
    openingHoursSetting.every(isOpeningSlot)
      ? openingHoursSetting
      : DEFAULT_CLINIC.openingHours;

  return {
    telephone: typeof settings.get("contact.phone") === "string"
      ? (settings.get("contact.phone") as string)
      : null,
    address: {
      streetAddress: s("contact.address_full", DEFAULT_CLINIC.address.streetAddress),
      addressLocality: s("contact.city", DEFAULT_CLINIC.address.addressLocality),
      addressRegion: s("contact.province", DEFAULT_CLINIC.address.addressRegion),
      addressCountry: s("contact.country", DEFAULT_CLINIC.address.addressCountry),
    },
    openingHours,
    social: {
      rubika: s("social.rubika", DEFAULT_CLINIC.social.rubika),
      bale: s("social.bale", DEFAULT_CLINIC.social.bale),
      instagram: s("social.instagram", DEFAULT_CLINIC.social.instagram),
    },
    maps: {
      neshan: s("contact.map_neshan", DEFAULT_CLINIC.maps.neshan),
      google: s("contact.map_google", DEFAULT_CLINIC.maps.google),
    },
  };
}
