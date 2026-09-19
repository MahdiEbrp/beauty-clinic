import type { SeedGroup } from "./types";
import { ENZYME_CATEGORY } from "./botox-enzyme-treatments";

export const ENZYME_GROUP: SeedGroup = {
  slug: "enzyme",
  icon: "droplet",
  displayOrder: 3,
  i18n: [
    {
      locale: "fa",
      name: "آنزیم",
      description:
        "تزریق آنزیم کره‌ای و انگلیسی برای اصلاح و حذف طبیعی فیلر اضافی؛ روشی دقیق و متناسب با نیاز شما.",
      seoTitle: "آنزیم | قیمت و خدمت اصلاح فیلر",
      seoDescription:
        "قیمت و مشاوره تزریق آنزیم کره‌ای و انگلیسی برای اصلاح فیلر و حذف طبیعی مواد؛ با رویکردی دقیق و متناسب با نیاز شما.",
    },
    {
      locale: "en",
      name: "Enzyme",
      description:
        "Korean and English enzyme injections to gently correct and dissolve excess filler with expert precision.",
      seoTitle: "Enzyme Service | Price & Filler Correction",
      seoDescription:
        "Enzyme service prices (Korean and English formulas) for gentle filler correction and dissolving, delivered with expert precision.",
    },
  ],
  categories: [ENZYME_CATEGORY],
};
