import type { SeedCategory, SeedGroup } from "./types";
import { LASER_FACE_AREAS_CATEGORY } from "./laser-hair-face-areas";
import { LASER_OTHER_BODY_CATEGORY } from "./laser-hair-body";
import { LASER_PACKAGES_CATEGORY } from "./laser-hair-packages";
import { LASER_PERSONAL_KIT_CATEGORY } from "./laser-hair-personal-kit";
import { IMG } from "../images";

const LASER_HAIR_SERVICES: SeedCategory = {
  slug: "laser-hair-removal-services",
  icon: "laser",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "خدمات لیزر موهای زائد",
      description: "پکیج‌ها و خدمات نواحی صورت و بدن در یک صفحه، بدون زیرشاخه.",
      seoTitle: "لیزر موهای زائد | خدمات و پکیج‌ها",
      seoDescription: "مشاهده تمام خدمات و پکیج‌های لیزر موهای زائد صورت و بدن در یک صفحه.",
    },
    {
      locale: "en",
      name: "Laser Hair Removal Services",
      description: "Packages and face and body treatments presented together on one page.",
      seoTitle: "Laser Hair Removal | Services & Packages",
      seoDescription: "Explore all face and body laser hair removal services and packages in one place.",
    },
  ],
  services: [
    ...LASER_PACKAGES_CATEGORY.services,
    ...LASER_FACE_AREAS_CATEGORY.services,
    ...LASER_OTHER_BODY_CATEGORY.services,
    ...LASER_PERSONAL_KIT_CATEGORY.services,
  ].map((service, index) => ({ ...service, displayOrder: index })),
};

export const LASER_HAIR_REMOVAL_GROUP: SeedGroup = {
  slug: "laser-hair-removal",
  icon: "laser",
  image: IMG.laserHairRemoval,
  displayOrder: 8,
  i18n: [
    {
      locale: "fa",
      name: "لیزر موهای زائد",
      description:
        "تمام خدمات و پکیج‌های لیزر موهای زائد در یک صفحه؛ با توضیحات و تصاویر قابل مدیریت برای هر خدمت.",
      seoTitle: "لیزر موهای زائد | صورت و بدن",
      seoDescription:
        "مشاهده پکیج‌ها و خدمات لیزر موهای زائد صورت و بدن همراه با جزئیات و تصاویر هر خدمت.",
    },
    {
      locale: "en",
      name: "Laser Hair Removal",
      description:
        "All laser hair removal services and packages on one page, with editable details and photos for each service.",
      seoTitle: "Laser Hair Removal | Face & Body",
      seoDescription:
        "Explore face and body laser hair removal packages and services with individual details and photos.",
    },
  ],
  categories: [LASER_HAIR_SERVICES],
};
