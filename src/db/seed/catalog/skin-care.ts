import type { SeedGroup } from "./types";
import { IMG } from "../images";

export const SKIN_CARE_GROUP: SeedGroup = {
  slug: "skin-care",
  icon: "flower",
  image: IMG.care,
  displayOrder: 9,
  i18n: [
    {
      locale: "fa",
      name: "پوست و مراقبت",
      description:
        "مراقبت و خدماتی تخصصی پوست برای شادابی، بهبود بافت و جوان‌تر شدن ظاهر چهره؛ از فیشیال تخصصی و میکرونیدلینگ تا خدماتی جوانسازی و لیفت.",
      seoTitle: "پوست و مراقبت | فیشیال و جوانسازی پوست",
      seoDescription:
        "خدمات تخصصی فیشیال، میکرونیدلینگ، جوانسازی و لیفت برای پاکسازی، بهبود بافت، شادابی و ظاهر جوان‌تر پوست.",
    },
    {
      locale: "en",
      name: "Skin Care",
      description:
        "Personalized skin services designed to refresh, refine, and rejuvenate your complexion — from advanced facials to microneedling and lifting services.",
      seoTitle: "Skin Care & Rejuvenation | Facial Services",
      seoDescription:
        "Discover advanced facials, microneedling, skin rejuvenation and lifting services designed to refresh, refine and improve your skin’s appearance.",
    },
  ],
  categories: [],
};