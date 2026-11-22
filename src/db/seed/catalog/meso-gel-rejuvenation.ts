import type { SeedCategory, SeedGroup } from "./types";
import { MESOTHERAPY_CATEGORY } from "./meso-rejuvenation-services";
import { HAIR_MESOTHERAPY_CATEGORY } from "./meso-hair-services";
import { SKIN_TREATMENT_SERVICES_CATEGORY } from "./skin-treatment-services";
import { IMG } from "../images";

const COMBINED_SKIN_HAIR_CATEGORY: SeedCategory = {
  ...MESOTHERAPY_CATEGORY,
  services: [
    ...MESOTHERAPY_CATEGORY.services,
    ...HAIR_MESOTHERAPY_CATEGORY.services,
    ...SKIN_TREATMENT_SERVICES_CATEGORY.services,
  ].map((service, index) => ({ ...service, displayOrder: index })),
};

export const MESO_GEL_REJUVENATION_GROUP: SeedGroup = {
  slug: "meso-gel-rejuvenation",
  icon: "rejuvenation",
  image: IMG.mesotherapy,
  displayOrder: 7,
  i18n: [
    {
      locale: "fa",
      name: "مزوژل، جوانساز، آبرسان و درمان‌های پوست و مو",
      description:
        "خدمات مزوتراپی، مزوژل، جوانسازی، آبرسانی و درمان‌های پوست و مو در یک صفحه؛ همراه با جزئیات هر خدمت.",
      seoTitle: "مزوژل، جوانساز و درمان پوست و مو | خدمات کلینیک",
      seoDescription:
        "مشاهده خدمات مزوژل، جوانسازی، آبرسانی، مزوتراپی پوست و مو و درمان‌های پوستی همراه با جزئیات هر خدمت.",
    },
    {
      locale: "en",
      name: "Mesogel, Rejuvenation, Hydration, Skin & Hair Treatments",
      description:
        "Mesotherapy, mesogel, rejuvenation, hydration, skin and hair treatments presented together on one page with service details.",
      seoTitle: "Mesogel, Rejuvenation, Skin & Hair Treatments",
      seoDescription:
        "Explore mesogel, rejuvenation, hydration, skin mesotherapy, hair treatments and skin services with individual details.",
    },
  ],
  categories: [COMBINED_SKIN_HAIR_CATEGORY],
};
