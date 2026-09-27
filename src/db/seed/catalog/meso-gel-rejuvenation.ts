import type { SeedGroup } from "./types";
import { MESOTHERAPY_CATEGORY } from "./meso-rejuvenation-services";
import { IMG } from "../images";

export const MESO_GEL_REJUVENATION_GROUP: SeedGroup = {
  slug: "meso-gel-rejuvenation",
  icon: "rejuvenation",
  image: IMG.mesotherapy,
  displayOrder: 6,
  i18n: [
    {
      locale: "fa",
      name: "مزو ژل و جوانساز و آبرسان",
      description:
        "با خدماتی تخصصی مزوتراپی، مزوژل و جوانسازی، به بهبود آبرسانی، کیفیت، شادابی و انعطاف‌پذیری پوست کمک کنید و ظاهری تازه‌تر و درخشان‌تر داشته باشید.",
      seoTitle: "مزو ژل و جوانساز | مزوتراپی و جوانسازی پوست",
      seoDescription:
        "خدمات مزوتراپی، مزوژل، جالپرو، پروفایلو و جوانسازها برای بهبود آبرسانی، کیفیت، شادابی و جوان‌تر شدن ظاهر پوست.",
    },
    {
      locale: "en",
      name: "Mesogel, Rejuvenation & Hydration",
      description:
        "Refresh, hydrate, and revitalize your skin with personalized mesogel and rejuvenation services designed to improve skin quality, elasticity, radiance, and overall vitality.",
      seoTitle: "Mesogel & Rejuvenation | Advanced Skin Treatments",
      seoDescription:
        "Discover personalized mesotherapy, mesogel, Jalupro and Profhilo services designed to refresh, hydrate and revitalize your skin.",
    },
  ],
  categories: [MESOTHERAPY_CATEGORY],
};
