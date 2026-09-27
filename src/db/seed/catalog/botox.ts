import type { SeedGroup } from "./types";
import { BOTOX_CATEGORIES } from "./botox-services";
import { IMG } from "../images";

export const BOTOX_GROUP: SeedGroup = {
  slug: "botox",
  icon: "gelBotox",
  image: IMG.botox,
  displayOrder: 3,
  i18n: [
    {
      locale: "fa",
      name: "بوتاکس",
      description:
        "با بوتاکس، خطوط صورت را نرم‌تر کرده و فرم و تعادل چهره را متناسب با ویژگی‌های شما بهبود دهید.",
      seoTitle: "بوتاکس | خدمات زیبایی و تزریق",
      seoDescription:
        "خدمات تخصصی بوتاکس برای فرم‌دهی چهره، کاهش خطوط، تعریق و میگرن؛ متناسب با نیاز و ویژگی‌های شما.",
    },
    {
      locale: "en",
      name: "Botox",
      description:
        "Refine your features, soften expression lines, and restore facial balance with personalized Botox treatments tailored to your aesthetic goals.",
      seoTitle: "Botox | Facial Aesthetics",
      seoDescription:
        "Discover personalized Botox services for facial refinement, expression lines, sweating, and migraines. Book your consultation.",
    },
  ],
  categories: BOTOX_CATEGORIES,
};
