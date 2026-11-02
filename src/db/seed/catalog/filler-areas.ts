import type { SeedCategory, SeedService } from "./types";
import {
  LOWER_FACE_BRANDS,
  UPPER_FACE_BRANDS,
  type FillerBrand,
} from "./filler-brands";
// IMG not used — filler categories carry no group-level image here.

/**
 * Face-filler catalog — one category per brand group, each brand listed once.
 *
 * Previously every anatomical area (lip, chin, cheek, …) re-listed the same
 * brands, so every brand appeared repeatedly across the pricing page. Now
 * there is a single "فیلر صورت" category with every lower-face brand listed
 * once, and a single "فیلر نقاط حساس" category with the mid/upper-face brands
 * listed once. Service slugs carry the area suffix only where a brand genuinely
 * has area-specific pricing (upper-face brands differ from lower-face prices).
 */

type FillerCategoryDef = {
  slug: string;
  faName: string;
  enName: string;
  faDesc: string;
  enDesc: string;
  displayOrder: number;
  brands: FillerBrand[];
  areaKey?: string; // slug suffix when the same brand has area-specific pricing
};

const CATEGORIES: FillerCategoryDef[] = [
  {
    slug: "face-filler-brands",
    faName: "فیلر صورت",
    enName: "Face Filler Brands",
    faDesc: "فیلر صورت با برندهای معتبر و متنوع.",
    enDesc: "Face filler with reputable and diverse brands.",
    displayOrder: 1,
    brands: LOWER_FACE_BRANDS,
  },
  {
    slug: "face-filler-sensitive",
    faName: "فیلر نقاط حساس",
    enName: "Sensitive Areas Filler",
    faDesc: "فیلر برای نقاط حساس چهره با برندهای معتبر.",
    enDesc: "Filler for sensitive facial areas with diverse brands.",
    displayOrder: 2,
    brands: UPPER_FACE_BRANDS,
    areaKey: "sensitive",
  },
];

function buildServices(category: FillerCategoryDef): SeedService[] {
  return category.brands.map((brand, index) => {
    const slug = category.areaKey
      ? `${brand.slug}-${category.areaKey}`
      : brand.slug;
    const areaLabel = category.areaKey ? ` (${category.faName})` : "";
    return {
      slug,
      price: brand.price,
      priceType: "fixed",
      displayOrder: index,
      i18n: [
        {
          locale: "fa",
          title: `${brand.fa}${areaLabel}`,
          shortDesc: `تزریق فیلر ${brand.fa}${areaLabel}؛ فرم‌دهی طبیعی، ظریف و ماندگار.`,
          seoTitle: `فیلر ${brand.fa}${areaLabel} | قیمت`,
          seoDescription: `قیمت و مشاوره تزریق فیلر ${brand.fa}${areaLabel}؛ فرم‌دهی طبیعی و ظریف با مشاوره تخصصی.`,
        },
        {
          locale: "en",
          title: `${brand.en}${areaLabel}`,
          shortDesc: `${brand.en} filler${areaLabel} — natural, refined and long-lasting contouring.`,
          seoTitle: `${brand.en} Filler${areaLabel} | Price`,
          seoDescription: `${brand.en} filler price and consultation. Natural, refined contouring with expert care.`,
        },
      ],
    };
  });
}

function toCategory(category: FillerCategoryDef): SeedCategory {
  return {
    slug: category.slug,
    icon: "syringe",
    displayOrder: category.displayOrder,
    i18n: [
      {
        locale: "fa",
        name: category.faName,
        description: category.faDesc,
        seoTitle: `${category.faName} | قیمت تزریق فیلر`,
        seoDescription: category.faDesc,
      },
      {
        locale: "en",
        name: category.enName,
        description: category.enDesc,
        seoTitle: `${category.enName} Filler | Price`,
        seoDescription: category.enDesc,
      },
    ],
    services: buildServices(category),
  };
}

export const FACE_FILLER_AREA_CATEGORIES: SeedCategory[] = CATEGORIES.map(
  toCategory,
);
