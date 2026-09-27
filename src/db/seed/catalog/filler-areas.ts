import type { SeedCategory, SeedService } from "./types";
import {
  LOWER_FACE_BRANDS,
  UPPER_FACE_BRANDS,
  type FillerBrand,
} from "./filler-brands";

/**
 * Face-filler catalog, grouped by anatomical area (per the clinic's request).
 *
 * Each area becomes a category under the `face-filler` group; the filler brands
 * relevant to that area become its services. Service slugs are suffixed with
 * the area key (`<brand>-<areaKey>`) so the globally-unique slug index is not
 * violated when the same brand appears under several areas.
 */
type AreaDef = {
  /** Short key appended to every service slug (e.g. `lip`). */
  key: string;
  /** Category slug (`face-filler-<key>`). */
  slug: string;
  fa: string;
  en: string;
  faDesc: string;
  enDesc: string;
  brands: FillerBrand[];
};

const AREAS: AreaDef[] = [
  {
    key: "lip",
    slug: "face-filler-lip",
    fa: "ناحیه لب",
    en: "Lip Area",
    faDesc:
      "حجم‌دهی و فرم‌دهی طبیعی لب با برندهای معتبر فیلر؛ لب‌هایی پرتر و متناسب با چهره شما.",
    enDesc:
      "Natural lip volumizing and shaping with trusted filler brands, tailored to your facial features.",
    brands: LOWER_FACE_BRANDS,
  },
  {
    key: "chin",
    slug: "face-filler-chin",
    fa: "ناحیه چانه",
    en: "Chin Area",
    faDesc:
      "فرم‌دهی و برجسته‌سازی چانه با فیلر برای تعادل و تناسب بیشتر پایین صورت.",
    enDesc:
      "Chin shaping and projection with filler for a more balanced lower face.",
    brands: LOWER_FACE_BRANDS,
  },
  {
    key: "cheek",
    slug: "face-filler-cheek",
    fa: "ناحیه گونه",
    en: "Cheek Area",
    faDesc:
      "حجم‌دهی و برجسته‌سازی گونه‌ها با فیلر برای چهره‌ای جوان‌تر و متعادل‌تر.",
    enDesc:
      "Cheek volumizing and contouring with filler for a youthful, balanced face.",
    brands: LOWER_FACE_BRANDS,
  },
  {
    key: "jaw-angle",
    slug: "face-filler-jaw-angle",
    fa: "ناحیه زاویه فک",
    en: "Jaw Angle Area",
    faDesc:
      "فرم‌دهی زاویه فک با فیلر برای خط‌گذاری دقیق‌تر و کانتور مشخص‌تر صورت.",
    enDesc:
      "Jaw angle contouring with filler for a sharper, better-defined facial contour.",
    brands: LOWER_FACE_BRANDS,
  },
  {
    key: "frown-lines",
    slug: "face-filler-frown-lines",
    fa: "ناحیه خط غم",
    en: "Frown Lines",
    faDesc:
      "پرکردن و کاهش خط غم بین ابروها با فیلر برای چهره‌ای شاداب‌تر و آرام‌تر.",
    enDesc:
      "Filler for the frown lines between the brows to soften and refresh the expression.",
    brands: LOWER_FACE_BRANDS,
  },
  {
    key: "smile-lines",
    slug: "face-filler-smile-lines",
    fa: "ناحیه خط لبخند",
    en: "Smile Lines",
    faDesc:
      "کاهش خط لبخند (نازولیبیال) با فیلر برای چهره‌ای جوان‌تر و طبیعی.",
    enDesc:
      "Filler for the smile lines (nasolabial folds) for a fresher, natural look.",
    brands: LOWER_FACE_BRANDS,
  },
  {
    key: "tear-trough",
    slug: "face-filler-tear-trough",
    fa: "ناحیه ناوگان اشکی",
    en: "Tear Trough",
    faDesc:
      "رفع گودی ناوگان اشکی با فیلر برای نگاهی شاداب‌تر و رفع خستگی چشم.",
    enDesc:
      "Filler for the tear trough to reduce hollowness and refresh tired-looking eyes.",
    brands: UPPER_FACE_BRANDS,
  },
  {
    key: "undereye",
    slug: "face-filler-undereye",
    fa: "ناحیه زیر چشم",
    en: "Under-eye Area",
    faDesc:
      "رفع گودی و تیرگی زیر چشم با فیلر برای نگاهی جوان‌تر و شاداب.",
    enDesc:
      "Filler for the under-eye area to reduce hollowness and dark circles.",
    brands: UPPER_FACE_BRANDS,
  },
  {
    key: "temple",
    slug: "face-filler-temple",
    fa: "ناحیه شقیقه",
    en: "Temple Area",
    faDesc:
      "حجم‌دهی شقیقه با فیلر برای متعادل‌سازی فرم بالای صورت و کاهش فرورفتگی.",
    enDesc:
      "Temple volumizing with filler to balance the upper face and reduce hollowing.",
    brands: UPPER_FACE_BRANDS,
  },
  {
    key: "nose",
    slug: "face-filler-nose",
    fa: "ناحیه بینی",
    en: "Nose Area",
    faDesc:
      "فرم‌دهی و اصلاح ظریف بینی با فیلر بدون جراحی؛ نتیجه‌ای طبیعی و متناسب.",
    enDesc:
      "Non-surgical nose reshaping with filler for a natural, balanced result.",
    brands: UPPER_FACE_BRANDS,
  },
  {
    key: "forehead",
    slug: "face-filler-forehead",
    fa: "ناحیه پیشانی",
    en: "Forehead Area",
    faDesc:
      "حجم‌دهی و صاف‌سازی ظریف پیشانی با فیلر برای فرمی متعادل و جوان.",
    enDesc:
      "Forehead volumizing and gentle smoothing with filler for a balanced, youthful look.",
    brands: UPPER_FACE_BRANDS,
  },
];

function buildServices(area: AreaDef): SeedService[] {
  return area.brands.map((brand, index) => ({
    slug: `${brand.slug}-${area.key}`,
    price: brand.price,
    priceType: "fixed",
    displayOrder: index,
    i18n: [
      {
        locale: "fa",
        title: `${brand.fa} (${area.fa})`,
        shortDesc: `تزریق فیلر ${brand.fa} در ${area.fa}؛ فرم‌دهی طبیعی، ظریف و ماندگار.`,
        seoTitle: `فیلر ${brand.fa} ${area.fa} | قیمت`,
        seoDescription: `قیمت و مشاوره تزریق فیلر ${brand.fa} در ${area.fa}؛ فرم‌دهی طبیعی و ظریف با مشاوره تخصصی.`,
      },
      {
        locale: "en",
        title: `${brand.en} (${area.en})`,
        shortDesc: `${brand.en} filler for the ${area.en} — natural, refined and long-lasting contouring.`,
        seoTitle: `${brand.en} Filler ${area.en} | Price`,
        seoDescription: `${brand.en} filler price and consultation for the ${area.en}. Natural, refined contouring with expert care.`,
      },
    ],
  }));
}

function toCategory(area: AreaDef, displayOrder: number): SeedCategory {
  return {
    slug: area.slug,
    icon: "syringe",
    displayOrder,
    i18n: [
      {
        locale: "fa",
        name: area.fa,
        description: area.faDesc,
        seoTitle: `${area.fa} | قیمت تزریق فیلر`,
        seoDescription: area.faDesc,
      },
      {
        locale: "en",
        name: area.en,
        description: area.enDesc,
        seoTitle: `${area.en} Filler | Price`,
        seoDescription: area.enDesc,
      },
    ],
    services: buildServices(area),
  };
}

/** The 11 face-filler area categories, ordered per the clinic's list. */
export const FACE_FILLER_AREA_CATEGORIES: SeedCategory[] = AREAS.map((area, index) =>
  toCategory(area, index),
);
