/**
 * Clinic facts used by structured data (JSON-LD) and the contact section.
 *
 * ── EDIT THIS FILE ONCE THE REAL DETAILS ARE CONFIRMED ──────────────────────
 *
 * `telephone` is intentionally `null`, not a placeholder. A fake number such as
 * "+98-XX-XXXXXXXXXX" in schema.org markup is worse than no number at all:
 * Google flags it as invalid and may distrust the whole entity. When the real
 * number is known, set it in E.164 format, e.g. "+982146000000", and it will be
 * picked up by JSON-LD automatically.
 */
export const clinic = {
  /** E.164, e.g. "+982146000000". Omitted from JSON-LD while null. */
  telephone: null as string | null,

  address: {
    /** Kept in Persian: this is the legal/postal address, not UI copy. */
    streetAddress:
      "اندیشه فاز دو - میدان مادر - ابتدای بلوار نیلوفر نبش بنفشه هفتم - پلاک ۳۹ - طبقه دو",
    addressLocality: "اندیشه",
    addressRegion: "تهران",
    addressCountry: "IR",
  },

  /**
   * Iranian working week: Saturday–Wednesday full days, Thursday half day,
   * Friday closed. The previous values listed Friday as open and omitted
   * Sunday, which inverted the week.
   *
   * VERIFY THESE before launch.
   */
  openingHours: [
    {
      days: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
      ] as const,
      opens: "09:00",
      closes: "19:00",
    },
    {
      days: ["Thursday"] as const,
      opens: "09:00",
      closes: "14:00",
    },
    // Friday: closed — represented by omission, per schema.org convention.
  ],

  social: {
    rubika: "https://rubika.ir/nafasclinic",
    bale: "https://ble.ir/nafasclinic",
  },

  maps: {
    neshan: "https://nshn.ir/rbvg0k2xLMq4",
    google: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2",
  },
} as const;
