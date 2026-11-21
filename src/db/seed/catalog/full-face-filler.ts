import type { SeedCategory, SeedGroup } from "./types";
import { FULL_FACE_PACKAGES_CATEGORY } from "./full-face-packages";
import { FILLER_10CC_CATEGORY } from "./face-filler-10cc";
import { IMG } from "../images";

const CONTOURING_PACKAGES_CATEGORY: SeedCategory = {
  slug: "contouring-packages",
  icon: "gift",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "پک‌های کانتورینگ و فول فیس",
      description: "پک‌های ۱۰ سی‌سی کانتورینگ و پکیج‌های فول فیس در یک صفحه.",
      seoTitle: "پک‌های کانتورینگ و فول فیس | قیمت",
      seoDescription: "مشاهده پکیج‌های فول فیس و پک‌های ۱۰ سی‌سی کانتورینگ به همراه جزئیات هر خدمت.",
    },
    {
      locale: "en",
      name: "Contouring & Full Face Packages",
      description: "10cc contouring packs and full-face packages in one service page.",
      seoTitle: "Contouring & Full Face Packages | Prices",
      seoDescription: "Explore full-face packages and 10cc contouring packs with details for each service.",
    },
  ],
  services: [
    ...FULL_FACE_PACKAGES_CATEGORY.services,
    ...FILLER_10CC_CATEGORY.services,
  ].map((service, index) => ({ ...service, displayOrder: index })),
};

export const FULL_FACE_FILLER_GROUP: SeedGroup = {
  slug: "full-face-filler",
  icon: "facial",
  image: IMG.fullFiller,
  displayOrder: 4,
  i18n: [
    {
      locale: "fa",
      name: "پک‌های کانتورینگ و فول فیس",
      description:
        "پکیج‌های کانتورینگ و فول فیس در یک صفحه؛ بدون مرحله انتخاب زیرشاخه.",
      seoTitle: "پک‌های کانتورینگ و فول فیس | فرم‌دهی و حجم‌دهی صورت",
      seoDescription: "مشاهده پکیج‌های فول فیس و پک‌های ۱۰ سی‌سی کانتورینگ با توضیحات خدمات.",
    },
    {
      locale: "en",
      name: "Contouring & Full Face Packages",
      description:
        "Contouring and full-face packages presented together on one page, without an extra category step.",
      seoTitle: "Contouring & Full Face Packages | Facial Contouring",
      seoDescription: "Explore contouring and full-face packages with their service details.",
    },
  ],
  categories: [CONTOURING_PACKAGES_CATEGORY],
};
