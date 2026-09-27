import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

/**
 * "آنزیم از بین برنده فیلر" — Mahdi's price list: hyaluronidase (English).
 */
export const ENZYME_CATEGORY: SeedCategory = {
  slug: "enzyme-services",
  icon: "droplet",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "آنزیم از بین برنده فیلر",
      description:
        "تزریق آنزیم هیالورونیداز برای اصلاح و حذف طبیعی فیلر اضافی؛ روشی دقیق و متناسب با نیاز شما.",
      seoTitle: "آنزیم از بین برنده فیلر | قیمت",
      seoDescription:
        "قیمت و مشاوره تزریق آنزیم هیالورونیداز برای اصلاح فیلر و حذف طبیعی مواد؛ با رویکردی دقیق و متناسب با نیاز شما.",
    },
    {
      locale: "en",
      name: "Filler-Dissolving Enzyme",
      description:
        "Hyaluronidase enzyme injections to gently correct and dissolve excess filler with expert precision.",
      seoTitle: "Filler-Dissolving Enzyme | Price",
      seoDescription:
        "Hyaluronidase enzyme price for gentle filler correction and dissolving, delivered with expert precision and care.",
    },
  ],
  services: [
    withSeo(
      svc("enzyme-hyaluronidase-english", "آنزیم هیالورونیداز (انگلیسی)", "Hyaluronidase (English)", 2_190_000, 0),
      {
        fa: {
          shortDesc:
            "آنزیم هیالورونیداز انگلیسی برای اصلاح و حذف فیلر اضافی؛ روشی ملایم و طبیعی برای بازگرداندن تعادل چهره.",
          seoTitle: "آنزیم هیالورونیداز انگلیسی | قیمت اصلاح فیلر",
          seoDescription:
            "قیمت و مشاوره تزریق آنزیم هیالورونیداز انگلیسی برای اصلاح و حذف فیلر اضافی؛ روشی ملایم و طبیعی برای بازگرداندن تعادل چهره.",
        },
        en: {
          shortDesc:
            "English hyaluronidase enzyme to gently correct and dissolve excess filler, restoring natural facial balance.",
          seoTitle: "Hyaluronidase (English) | Price for Filler Correction",
          seoDescription:
            "English hyaluronidase enzyme price for gentle correction and dissolving of excess filler, restoring natural facial balance.",
        },
      },
    ),
  ],
};
