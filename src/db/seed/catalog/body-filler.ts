import type { SeedCategory, SeedGroup } from "./types";
import { svc, withSeo } from "./types";
import { IMG } from "../images";

/**
 * "فیلر بدن" — split into the two treatment areas from the clinic's list
 * (hips / bikini). Each area offers the same three volume options (per cc,
 * 50cc, 100cc); slugs are suffixed with the area key to stay globally unique.
 */
type BodyArea = {
  key: string;
  fa: string;
  en: string;
  faDesc: string;
  enDesc: string;
};

const BODY_AREAS: BodyArea[] = [
  {
    key: "hip",
    fa: "فیلر باسن",
    en: "Hip Filler",
    faDesc:
      "فرم‌دهی و حجم‌دهی طبیعی باسن با فیلر؛ تناسب و کانتور بهتر متناسب با اندام شما.",
    enDesc:
      "Natural hip contouring and volumizing with filler for better balance, tailored to your body.",
  },
  {
    key: "bikini",
    fa: "فیلر بیکینی",
    en: "Bikini Filler",
    faDesc:
      "فرم‌دهی و حجم‌دهی ناحیه بیکینی با فیلر؛ رویکردی ظریف، ایمن و متناسب.",
    enDesc:
      "Bikini-area contouring and volumizing with filler — a refined, safe and personalized approach.",
  },
];

type Volume = {
  key: string;
  fa: string;
  en: string;
  price: number;
  priceType: "fixed" | "from";
  faShort: string;
  enShort: string;
};

const BODY_VOLUMES: Volume[] = [
  {
    key: "per-cc",
    fa: "هر سی‌سی",
    en: "per cc",
    price: 390_000,
    priceType: "from",
    faShort: "فیلر بدن به ازای هر سی‌سی؛ مشاوره برای تعیین حجم مناسب.",
    enShort: "Body filler per cc with consultation to determine the right volume.",
  },
  {
    key: "50cc",
    fa: "۵۰ سی‌سی",
    en: "50cc",
    price: 18_500_000,
    priceType: "fixed",
    faShort: "پک ۵۰ سی‌سی فیلر بدن؛ تعادل مناسب بین قیمت و حجم.",
    enShort: "50cc body filler pack — a good balance between price and volume.",
  },
  {
    key: "100cc",
    fa: "۱۰۰ سی‌سی",
    en: "100cc",
    price: 34_900_000,
    priceType: "fixed",
    faShort: "پک ۱۰۰ سی‌سی فیلر بدن؛ اقتصادی‌ترین گزینه برای حجم‌دهی بالا.",
    enShort: "100cc body filler pack — the most economical option for high volume.",
  },
];

function buildCategory(area: BodyArea, displayOrder: number): SeedCategory {
  return {
    slug: `body-filler-${area.key}`,
    icon: "bodyFiller",
    displayOrder,
    i18n: [
      {
        locale: "fa",
        name: area.fa,
        description: area.faDesc,
        seoTitle: `${area.fa} | قیمت`,
        seoDescription: area.faDesc,
      },
      {
        locale: "en",
        name: area.en,
        description: area.enDesc,
        seoTitle: `${area.en} | Price`,
        seoDescription: area.enDesc,
      },
    ],
    services: BODY_VOLUMES.map((volume, index) =>
      withSeo(
        svc(
          `body-filler-${area.key}-${volume.key}`,
          `${area.fa} ${volume.fa}`,
          `${area.en} ${volume.en}`,
          volume.price,
          index,
          volume.priceType,
        ),
        {
          fa: {
            shortDesc: `${volume.faShort} (${area.fa})`,
            seoTitle: `${area.fa} ${volume.fa} | قیمت`,
            seoDescription: `قیمت ${area.fa} ${volume.fa}؛ ${area.faDesc}`,
          },
          en: {
            shortDesc: `${volume.enShort} (${area.en})`,
            seoTitle: `${area.en} ${volume.en} | Price`,
            seoDescription: `${area.en} ${volume.en} price. ${area.enDesc}`,
          },
        },
      ),
    ),
  };
}

export const BODY_FILLER_GROUP: SeedGroup = {
  slug: "body-filler",
  icon: "bodyFiller",
  image: IMG.bodyFiller,
  displayOrder: 5,
  i18n: [
    {
      locale: "fa",
      name: "فیلر بدن",
      description:
        "فرم طبیعی بدن خود را با روشی ظریف و متناسب با ویژگی‌های شما زیباتر کنید.\nبا هدف بهبود حجم، تناسب و فرم در نواحی منتخب، برای ایجاد ظاهری متعادل‌تر، هماهنگ‌تر و جذاب‌تر.",
      seoTitle: "فیلر بدن | کانتورینگ طبیعی باسن و بیکینی",
      seoDescription:
        "با فیلر بدن، تناسب و کانتور باسن و ناحیه بیکینی را با رویکردی ظریف و متناسب با ویژگی‌های شما بهبود دهید. مشاوره و رزرو نوبت.",
    },
    {
      locale: "en",
      name: "Body Filler",
      description:
        "Enhance your body's natural contours with a refined, personalized approach.\nDesigned to improve volume, balance and definition in selected areas for a more harmonious and confident silhouette.",
      seoTitle: "Body Filler | Hips & Bikini Contouring",
      seoDescription:
        "Explore personalized body filler services for the hips and bikini area, designed to enhance shape and definition with a refined, natural-looking approach.",
    },
  ],
  categories: BODY_AREAS.map((area, index) => buildCategory(area, index)),
};
