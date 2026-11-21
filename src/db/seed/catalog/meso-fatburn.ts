import type { SeedGroup } from "./types";
import { MESO_FATBURN_CATEGORY } from "./meso-fatburn-services";
import { IMG } from "../images";

export const MESO_FATBURN_GROUP: SeedGroup = {
  slug: "meso-fatburn",
  icon: "body",
  image: IMG.bodyFiller,
  displayOrder: 12,
  i18n: [
    {
      locale: "fa",
      name: "چربی‌سوزی و لاغری موضعی",
      description:
        "مزوچربی‌سوز برای کاهش موضعی چربی و فرم‌دهی نواحی موردنظر؛ متناسب با ناحیه و نیاز شما.",
      seoTitle: "چربی‌سوزی و لاغری موضعی | کاهش چربی موضعی",
      seoDescription:
        "خدمات مزوچربی‌سوز برای کاهش موضعی چربی و فرم‌دهی نواحی موردنظر، متناسب با نیاز شما.",
    },
    {
      locale: "en",
      name: "Fat Burning & Local Slimming",
      description:
        "Meso fat-burning for targeted, localized fat reduction and contouring of the areas you choose.",
      seoTitle: "Fat Burning & Local Slimming",
      seoDescription:
        "Meso fat-burning services for targeted fat reduction and contouring, tailored to your needs.",
    },
  ],
  categories: [MESO_FATBURN_CATEGORY],
};
