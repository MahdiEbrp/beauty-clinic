import type { SettingInput } from "@/lib/validation/settings-admin";

/**
 * Page-level copy for the public pricing/article page. Seed data only — the
 * live values live in the `settings` table (keys `pricing.*`) and are editable
 * from the admin Settings UI. No clinic/pricing content is hardcoded in React.
 */
export const PRICING_PAGE_SETTINGS: SettingInput[] = [
  {
    key: "pricing.page.title",
    value: "تعرفه خدمات کلینیک زیبایی نفس",
    type: "localized",
    translations: {
      fa: "تعرفه خدمات کلینیک زیبایی نفس",
      en: "Nafas Beauty Clinic Price List",
    },
  },
  {
    key: "pricing.page.intro",
    value: "لیست شفاف قیمت خدمات زیبایی که توسط تیم متخصص ما ارائه می‌شود.",
    type: "localized",
    translations: {
      en: "Our transparent list of beauty service prices, performed by our medical team.",
    },
  },
  {
    key: "pricing.page.seo_title",
    value: "قیمت خدمات | کلینیک زیبایی نفس",
    type: "localized",
    translations: { en: "Service Pricing | Nafas Beauty Clinic" },
  },
  {
    key: "pricing.page.seo_description",
    value:
      "لیست کامل قیمت خدمات زیبایی کلینیک نفس شامل فیلر، بوتاکس، مزوتراپی و لیزر با بهترین برندها",
    type: "localized",
    translations: {
      en: "Complete price list for Nafas Clinic beauty services including filler, botox, mesotherapy and laser with top brands",
    },
  },
  { key: "pricing.page.updated", value: "2026-06-15", type: "string" },
  {
    key: "pricing.cta.title",
    value: "می‌خواهید نوبت رزرو کنید؟",
    type: "localized",
    translations: { en: "Ready to book an appointment?" },
  },
  {
    key: "pricing.cta.description",
    value: "برای دریافت نوبت و استعلام قیمت اختصاصی با ما در تماس باشید.",
    type: "localized",
    translations: {
      en: "Contact us to book a visit and get a personalized price quote.",
    },
  },
  {
    key: "pricing.cta.primary_label",
    value: "رزرو نوبت",
    type: "localized",
    translations: { en: "Book an appointment" },
  },
  { key: "pricing.cta.primary_url", value: "/booking", type: "string" },
  {
    key: "pricing.cta.secondary_label",
    value: "مشاهده خدمات",
    type: "localized",
    translations: { en: "View services" },
  },
  { key: "pricing.cta.secondary_url", value: "/services", type: "string" },
];