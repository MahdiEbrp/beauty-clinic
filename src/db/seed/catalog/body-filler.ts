import type { SeedCategory, SeedGroup } from "./types";
import { svc, withSeo } from "./types";
import { IMG } from "../images";

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
    faDesc: "فرم‌دهی و حجم‌دهی ناحیه باسن با فیلر، متناسب با نیاز مراجعه‌کننده.",
    enDesc: "Body filler services for the hip area, tailored to the client's needs.",
  },
  {
    key: "bikini",
    fa: "فیلر بیکینی",
    en: "Bikini Filler",
    faDesc: "خدمات فیلر ناحیه بیکینی، متناسب با نیاز مراجعه‌کننده.",
    enDesc: "Filler services for the bikini area, tailored to the client's needs.",
  },
];

const BODY_VOLUMES = [
  {
    key: "per-cc",
    fa: "هر سی‌سی",
    en: "per cc",
    price: 390_000,
    priceType: "from" as const,
    faShort: "فیلر بدن به ازای هر سی‌سی؛ حجم نهایی در مشاوره مشخص می‌شود.",
    enShort: "Body filler priced per cc; the final volume is determined during consultation.",
  },
  {
    key: "50cc",
    fa: "۵۰ سی‌سی",
    en: "50cc",
    price: 18_500_000,
    priceType: "fixed" as const,
    faShort: "پک ۵۰ سی‌سی فیلر بدن.",
    enShort: "50cc body filler pack.",
  },
  {
    key: "100cc",
    fa: "۱۰۰ سی‌سی",
    en: "100cc",
    price: 34_900_000,
    priceType: "fixed" as const,
    faShort: "پک ۱۰۰ سی‌سی فیلر بدن.",
    enShort: "100cc body filler pack.",
  },
];

const BODY_FILLER_CATEGORY: SeedCategory = {
  slug: "body-filler-services",
  icon: "bodyFiller",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "خدمات فیلر بدن",
      description: "خدمات فیلر بدن در نواحی مختلف، همراه با جزئیات و تصاویر قابل مدیریت.",
      seoTitle: "فیلر بدن | خدمات و پکیج‌ها",
      seoDescription: "خدمات و پکیج‌های فیلر بدن؛ جزئیات و تصاویر هر خدمت در صفحه همین گروه نمایش داده می‌شود.",
    },
    {
      locale: "en",
      name: "Body Filler Services",
      description: "Body filler services for different areas, with editable details and photos.",
      seoTitle: "Body Filler | Services & Packages",
      seoDescription: "Explore body filler services and packages with details and photos displayed on this group page.",
    },
  ],
  services: BODY_AREAS.flatMap((area, areaIndex) =>
    BODY_VOLUMES.map((volume, volumeIndex) =>
      withSeo(
        svc(
          `body-filler-${area.key}-${volume.key}`,
          `${area.fa} ${volume.fa}`,
          `${area.en} ${volume.en}`,
          volume.price,
          areaIndex * BODY_VOLUMES.length + volumeIndex,
          volume.priceType,
        ),
        {
          fa: {
            shortDesc: `${volume.faShort} (${area.fa})`,
            seoTitle: `${area.fa} ${volume.fa} | قیمت`,
            seoDescription: `${volume.faShort} ${area.faDesc}`,
          },
          en: {
            shortDesc: `${volume.enShort} (${area.en})`,
            seoTitle: `${area.en} ${volume.en} | Price`,
            seoDescription: `${volume.enShort} ${area.enDesc}`,
          },
        },
      ),
    ),
  ),
};

export const BODY_FILLER_GROUP: SeedGroup = {
  slug: "body-filler",
  icon: "bodyFiller",
  image: IMG.bodyFiller,
  displayOrder: 3,
  i18n: [
    {
      locale: "fa",
      name: "فیلر بدن",
      description:
        "خدمات فیلر بدن در یک صفحه، بدون مرحله انتخاب زیرشاخه؛ توضیحات و تصاویر هر خدمت در همین صفحه نمایش داده می‌شود.",
      seoTitle: "فیلر بدن | خدمات و پکیج‌های فیلر بدن",
      seoDescription: "مشاهده خدمات و پکیج‌های فیلر بدن، توضیحات و تصاویر هر خدمت.",
    },
    {
      locale: "en",
      name: "Body Filler",
      description:
        "Explore body filler services on one page, with each treatment's details and photos shown together.",
      seoTitle: "Body Filler | Services & Packages",
      seoDescription: "Explore body filler services and packages, including descriptions and photos for each service.",
    },
  ],
  categories: [BODY_FILLER_CATEGORY],
};
