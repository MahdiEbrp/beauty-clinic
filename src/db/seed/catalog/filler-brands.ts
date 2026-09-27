/**
 * Shared filler brand lists used to build the face-filler area categories.
 *
 * The clinic prices fillers by brand, then groups them by the anatomical area
 * they are used in. Both lists below mirror the clinic's injectable price list:
 *
 * - `LOWER_FACE_BRANDS`    → "فیلر لب و صورت"      (Juvederm → Audrey, 15 brands)
 * - `UPPER_FACE_BRANDS`    → "فیلر زیرچشم - شقیقه - بینی - پیشانی" (3 brands)
 *
 * Each area category re-uses the relevant list; service slugs are suffixed with
 * the area key (see `filler-areas.ts`) so they stay globally unique.
 */
export type FillerBrand = {
  slug: string;
  fa: string;
  en: string;
  price: number;
};

/** "فیلر لب و صورت" — lower-face brands. */
export const LOWER_FACE_BRANDS: FillerBrand[] = [
  { slug: "juvederm", fa: "ژوویدرم", en: "Juvederm", price: 26_490_000 },
  { slug: "elansse", fa: "الانسه", en: "Elansse", price: 24_900_000 },
  { slug: "stylage", fa: "استایلیج", en: "Stylage", price: 23_900_000 },
  { slug: "repleneal", fa: "ریلن", en: "Repleneal", price: 15_900_000 },
  { slug: "perfecta", fa: "پرفکتا", en: "Perfecta", price: 10_900_000 },
  { slug: "revofil-plus", fa: "رووفیل پلاس", en: "Revofil Plus", price: 9_900_000 },
  { slug: "innovance", fa: "اینووسنس", en: "Innovance", price: 6_590_000 },
  { slug: "fillerge", fa: "فیورج", en: "Fillerge", price: 6_290_000 },
  { slug: "dime", fa: "دی می", en: "Dime", price: 5_990_000 },
  { slug: "dermarkin", fa: "درم آرکان", en: "Dermarkin", price: 5_390_000 },
  { slug: "aptq", fa: "اپی تی کیو", en: "APTQ", price: 2_990_000 },
  { slug: "zeishel", fa: "زیشل", en: "Zeishel", price: 2_690_000 },
  { slug: "denby", fa: "دنبی", en: "Denby", price: 2_490_000 },
  { slug: "revofil", fa: "رووفیل", en: "Revofil", price: 2_190_000 },
  { slug: "audrey", fa: "اودری", en: "Audrey", price: 1_890_000 },
];

/** "فیلر زیرچشم - شقیقه - بینی - پیشانی" — mid/upper-face brands. */
export const UPPER_FACE_BRANDS: FillerBrand[] = [
  { slug: "innovance-upper", fa: "اینووسنس", en: "Innovance", price: 6_790_000 },
  { slug: "fillerge-upper", fa: "فیورج", en: "Fillerge", price: 6_390_000 },
  { slug: "dime-upper", fa: "دی می", en: "Dime", price: 6_190_000 },
];
