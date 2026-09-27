import type { SeedGroup } from "./types";
import { SKIN_TREATMENT_SERVICES_CATEGORY } from "./skin-treatment-services";
import { IMG } from "../images";

export const SKIN_TREATMENTS_GROUP: SeedGroup = {
  slug: "skin-treatments",
  icon: "peel",
  image: IMG.care,
  displayOrder: 9,
  i18n: [
    {
      locale: "fa",
      name: "درمان‌های پوستی",
      description:
        "خدمات تخصصی درمان پوست برای بهبود بافت، لک، جوش و شادابی؛ متناسب با نوع پوست و نیاز شما.",
      seoTitle: "درمان‌های پوستی | بهبود بافت، لک و شادابی پوست",
      seoDescription:
        "خدمات درمانی پوست برای بهبود بافت، کاهش لک و جوش و افزایش شادابی؛ با رویکردی متناسب با نوع پوست شما.",
    },
    {
      locale: "en",
      name: "Skin Treatments",
      description:
        "Specialized skin treatments to improve texture, pigmentation, acne and overall radiance, tailored to your skin.",
      seoTitle: "Skin Treatments | Texture, Pigmentation & Radiance",
      seoDescription:
        "Specialized skin treatments to improve texture, reduce pigmentation and acne and boost radiance, tailored to your skin type.",
    },
  ],
  categories: [SKIN_TREATMENT_SERVICES_CATEGORY],
};
