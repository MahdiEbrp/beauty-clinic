import type { SeedGroup } from "./types";
import { UPPER_FACE_BRANDS } from "./filler-brands";
import { buildFillerBrandCategory } from "./filler-area-builder";
import { IMG } from "../images";

export const SENSITIVE_FILLER_GROUP: SeedGroup = {
  slug: "sensitive-filler",
  icon: "facial",
  image: IMG.filler,
  displayOrder: 2,
  i18n: [
    {
      locale: "fa",
      name: "فیلر نواحی حساس",
      description: "خدمات فیلر نواحی حساس صورت شامل زیر چشم، پیشانی، شقیقه و بینی.",
      seoTitle: "فیلر نواحی حساس | زیر چشم، پیشانی، شقیقه و بینی",
      seoDescription: "معرفی خدمات فیلر برای نواحی حساس صورت با جزئیات و تصاویر قابل مدیریت.",
    },
    {
      locale: "en",
      name: "Sensitive Areas Filler",
      description: "Filler services for sensitive facial areas including under-eyes, forehead, temples and nose.",
      seoTitle: "Sensitive Areas Filler | Under-eyes, Forehead, Temples & Nose",
      seoDescription: "Explore filler services for sensitive facial areas with editable details and photos.",
    },
  ],
  categories: [
    buildFillerBrandCategory(
      {
        slug: "sensitive-filler-brands",
        faName: "فیلر زیرچشم - شقیقه - بینی - پیشانی",
        enName: "Under-eye, Temple, Nose and Forehead Filler",
        faDescription:
          "برندهای فیلر قابل استفاده برای زیرچشم، شقیقه، بینی و پیشانی؛ هر برند و قیمت آن فقط یک‌بار در فهرست قیمت نمایش داده می‌شود.",
        enDescription:
          "Filler brands for under-eyes, temples, nose and forehead. Each brand and its price are listed only once.",
      },
      UPPER_FACE_BRANDS,
      "sensitive-filler",
    ),
  ],
};
