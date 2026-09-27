import type { SeedGroup } from "./types";
import { ENZYME_CATEGORY } from "./enzyme-services";
import { IMG } from "../images";

export const ENZYME_GROUP: SeedGroup = {
  slug: "enzyme",
  icon: "facial",
  image: IMG.botox,
  displayOrder: 4,
  i18n: [
    {
      locale: "fa",
      name: "آنزیم از بین برنده فیلر",
      description:
        "تزریق آنزیم برای اصلاح و حذف طبیعی فیلر اضافی؛ روشی دقیق و متناسب با نیاز شما.",
      seoTitle: "آنزیم | قیمت و خدمت اصلاح فیلر",
      seoDescription:
        "قیمت و مشاوره تزریق آنزیم برای اصلاح فیلر و حذف طبیعی مواد؛ با رویکردی دقیق و متناسب با نیاز شما.",
    },
    {
      locale: "en",
      name: "Filler-Dissolving Enzyme",
      description:
        "Enzyme injections to gently correct and dissolve excess filler with expert precision.",
      seoTitle: "Filler-Dissolving Enzyme | Price & Filler Correction",
      seoDescription:
        "Enzyme service prices for gentle filler correction and dissolving, delivered with expert precision.",
    },
  ],
  categories: [ENZYME_CATEGORY],
};
