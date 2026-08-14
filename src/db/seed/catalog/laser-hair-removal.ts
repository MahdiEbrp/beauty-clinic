import type { SeedGroup } from "./types";
import { LASER_FACE_AREAS_CATEGORY } from "./laser-hair-face-areas";
import { LASER_OTHER_BODY_CATEGORY } from "./laser-hair-other-body";
import { LASER_PACKAGES_CATEGORY } from "./laser-hair-packages";
import { LASER_PERSONAL_KIT_CATEGORY } from "./laser-hair-personal-kit";

export const LASER_HAIR_REMOVAL_GROUP: SeedGroup = {
  slug: "laser-hair-removal",
  icon: "spotlight",
  displayOrder: 6,
  i18n: [
    {
      locale: "fa",
      name: "لیزر مو",
      description:
        "با لیزر موهای زائد، پوستی صاف‌تر و یکدست‌تر داشته باشید؛ با پکیج‌هایی متناسب با نیاز و نواحی موردنظر شما.",
      seoTitle: "لیزر موهای زائد | صورت و بدن",
      seoDescription:
        "لیزر موهای زائد برای صورت و بدن با پکیج‌های متنوع و امکان انتخاب نواحی دلخواه؛ از صورت و زیربغل تا پاها و فول‌بادی.",
    },
    {
      locale: "en",
      name: "Laser Hair Removal",
      description:
        "Smooth, confident skin with personalized laser hair removal treatments tailored to your needs and target areas.",
      seoTitle: "Laser Hair Removal | Face & Body Treatments",
      seoDescription:
        "Achieve smoother-looking skin with personalized laser hair removal for the face and body. Explore individual areas, packages, and full-body treatments.",
    },
  ],
  categories: [
    LASER_PACKAGES_CATEGORY,
    LASER_FACE_AREAS_CATEGORY,
    LASER_OTHER_BODY_CATEGORY,
    LASER_PERSONAL_KIT_CATEGORY,
  ],
};
