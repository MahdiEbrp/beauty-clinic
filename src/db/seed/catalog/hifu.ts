import type { SeedGroup } from "./types";

export const HIFU_GROUP: SeedGroup = {
  slug: "hifu",
  icon: "scan-face",
  displayOrder: 8,
  i18n: [
    {
      locale: "fa",
      name: "هایفوتراپی",
      description:
        "با هایفوتراپی، به سفت‌تر شدن پوست و بهبود فرم و کانتور صورت و بدن کمک کنید؛ با درمانی متناسب با نیاز و ناحیه موردنظر شما.",
      seoTitle: "هایفوتراپی | لیفت و سفتی پوست صورت و بدن",
      seoDescription:
        "هایفوتراپی صورت و بدن برای کمک به سفت‌تر شدن پوست و بهبود فرم و کانتور نواحی موردنظر، با رویکردی متناسب و طبیعی.",
    },
    {
      locale: "en",
      name: "HIFU",
      description:
        "Lift, tighten, and redefine your natural contours with personalized HIFU treatments for the face and body.",
      seoTitle: "HIFU Treatment | Face & Body Skin Tightening",
      seoDescription:
        "Discover personalized HIFU treatments for the face and body, designed to support firmer-looking skin and more defined, natural-looking contours.",
    },
  ],
  categories: [
    {
      slug: "hifu-services",
      icon: "scan-face",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "خدمات هایفو",
          description:
            "درمان‌های هایفوتراپی برای لیفت، سفت‌شدن و بهبود فرم و کانتور صورت و بدن؛ متناسب با نیاز و ناحیه موردنظر شما.",
          seoTitle: "خدمات هایفوتراپی | لیفت و سفتی پوست",
          seoDescription:
            "درمان‌های هایفوتراپی صورت و بدن برای لیفت، سفت‌شدن و بهبود فرم و کانتور نواحی موردنظر، با رویکردی متناسب و طبیعی.",
        },
        {
          locale: "en",
          name: "HIFU Services",
          description:
            "HIFU treatments to lift, tighten and improve the shape and contour of the face and body, tailored to your needs and target area.",
          seoTitle: "HIFU Services | Lift & Skin Tightening",
          seoDescription:
            "HIFU treatments for the face and body to lift, tighten and enhance natural contours with a personalized, natural-looking approach.",
        },
      ],
      // Empty on purpose — Mahdi will provide HIFU pricing separately.
      // Structure kept here so the group/category exists and services
      // can be pushed in without touching anything else.
      services: [],
    },
  ],
};