import type { SeedGroup } from "./types";
import { svc, withSeo } from "./types";
import { IMG } from "../images";

export const BODY_FILLER_GROUP: SeedGroup = {
  slug: "body-filler",
  icon: "hand-coins",
  image: IMG.bodyFiller,
  displayOrder: 1,
  i18n: [
    {
      locale: "fa",
      name: "فیلر بادی",
      description:
        "فرم طبیعی بدن خود را با روشی ظریف و متناسب با ویژگی‌های شما زیباتر کنید.\nبا هدف بهبود حجم، تناسب و فرم در نواحی منتخب، برای ایجاد ظاهری متعادل‌تر، هماهنگ‌تر و جذاب‌تر.",
      seoTitle: "فیلر بدن و فرم‌دهی | کانتورینگ طبیعی",
      seoDescription:
        "با فیلر و خدمات فرم‌دهی بدن، تناسب و کانتور نواحی موردنظر را با رویکردی ظریف و متناسب با ویژگی‌های شما بهبود دهید. مشاوره و رزرو نوبت.",
    },
    {
      locale: "en",
      name: "Body Filler",
      description:
        "Enhance your body’s natural contours with a refined, personalized approach.\nDesigned to improve volume, balance and definition in selected areas for a more harmonious and confident silhouette.",
      seoTitle: "Body Filler & Contouring | Natural-Looking Results",
      seoDescription:
        "Explore personalized body filler and contouring services designed to enhance shape and definition with a refined, natural-looking approach.Book a consultatio.",
    },
  ],
  categories: [
    {
      slug: "body-filler-hip-bikini",
      icon: "hand-coins",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "فیلر بادی (باسن و بیکینی)",
          description:
            "فرم‌دهی طبیعی باسن و ناحیه بیکینی با فیلر؛ افزایش حجم و بهبود تناسب، متناسب با ویژگی‌های بدن شما و با نتیجه‌ای ماندگار.",
          seoTitle: "فیلر بادی باسن و بیکینی | قیمت",
          seoDescription:
            "قیمت و مشاوره فیلر بادی برای باسن و ناحیه بیکینی؛ فرم‌دهی طبیعی و افزایش حجم متناسب با ویژگی‌های بدن شما.",
        },
        {
          locale: "en",
          name: "Body Filler (Hips & Bikini)",
          description:
            "Natural hip and bikini-area contouring with filler — enhance volume and improve balance, tailored to your body with long-lasting results.",
          seoTitle: "Body Filler for Hips & Bikini Area | Price",
          seoDescription:
            "Body filler price and consultation for hips and bikini area. Enhance natural volume and shape tailored to your body.",
        },
      ],
      services: [
        withSeo(svc("body-filler-per-cc", "فیلر بادی هر سی سی", "Body Filler per cc", 390_000, 0), {
          fa: {
            shortDesc:
              "فیلر بادی هر سی سی برای فرم‌دهی و افزایش حجم باسن و ناحیه بیکینی؛ با مشاوره حرفه‌ای و متناسب با بدن شما.",
            seoTitle: "فیلر بادی هر سی سی | قیمت",
            seoDescription:
              "قیمت فیلر بادی هر سی سی برای فرم‌دهی باسن و ناحیه بیکینی؛ با مشاوره حرفه‌ای و تعیین حجم مناسب برای بدن شما.",
          },
          en: {
            shortDesc:
              "Body filler per cc for contouring and adding volume to the hips and bikini area with expert consultation.",
            seoTitle: "Body Filler per cc | Price",
            seoDescription:
              "Body filler per cc price for hips and bikini area contouring with expert consultation to determine the right volume for you.",
          },
        }),
      ],
    },
  ],
};