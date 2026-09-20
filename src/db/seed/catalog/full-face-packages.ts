import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const FULL_FACE_PACKAGES_CATEGORY: SeedCategory = {
  slug: "full-face-packages",
  icon: "sparkles",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "پکیج‌های فول فیس",
      description:
        "پکیج‌های حجم‌دهی و فرم‌دهی کامل صورت با ترکیب چند ناحیه؛ متناسب با نیاز چهره شما و با نتیجه‌ای هماهنگ و طبیعی.",
      seoTitle: "پکیج فول فیس | حجم‌دهی و فرم‌دهی کامل صورت",
      seoDescription:
        "قیمت پکیج‌های فول فیس برای حجم‌دهی و فرم‌دهی هماهنگ صورت؛ با ترکیب نواحی مختلف و نتیجه‌ای طبیعی و متعادل.",
    },
    {
      locale: "en",
      name: "Full Face Packages",
      description:
        "Complete facial volume and contouring packages combining multiple areas for a harmonious, natural result.",
      seoTitle: "Full Face Packages | Volume & Contouring",
      seoDescription:
        "Full face filler package prices for harmonious facial volume and contouring, combining multiple areas for a natural, balanced look.",
    },
  ],
  services: [
    withSeo(
      svc("full-face-package-3cc", "پک فول فیس ۳ سی‌سی", "Full Face Package 3cc", 12_900_000, 0),
      {
        fa: {
          shortDesc: "پک فول فیس ۳ سی‌سی برای حجم‌دهی سبک و طبیعی نواحی کلیدی صورت.",
          seoTitle: "پک فول فیس ۳ سی‌سی | قیمت",
          seoDescription:
            "قیمت پک فول فیس ۳ سی‌سی برای حجم‌دهی سبک و طبیعی نواحی کلیدی صورت با نتیجه‌ای هماهنگ.",
        },
        en: {
          shortDesc: "3cc full face package for light, natural volume in key facial areas.",
          seoTitle: "Full Face Package 3cc | Price",
          seoDescription:
            "3cc full face filler package price for light, natural volume in key facial areas with a harmonious result.",
        },
      },
    ),
    withSeo(
      svc("full-face-package-5cc", "پک فول فیس ۵ سی‌سی", "Full Face Package 5cc", 19_900_000, 1),
      {
        fa: {
          shortDesc: "پک فول فیس ۵ سی‌سی برای فرم‌دهی و تعادل بیشتر در چند ناحیه صورت.",
          seoTitle: "پک فول فیس ۵ سی‌سی | قیمت",
          seoDescription:
            "قیمت پک فول فیس ۵ سی‌سی برای فرم‌دهی و تعادل بیشتر در چند ناحیه صورت با نتیجه‌ای طبیعی.",
        },
        en: {
          shortDesc: "5cc full face package for greater contouring and balance across facial areas.",
          seoTitle: "Full Face Package 5cc | Price",
          seoDescription:
            "5cc full face filler package price for greater contouring and balance across multiple facial areas.",
        },
      },
    ),
    withSeo(
      svc("full-face-package-8cc", "پک فول فیس ۸ سی‌سی", "Full Face Package 8cc", 29_900_000, 2),
      {
        fa: {
          shortDesc: "پک فول فیس ۸ سی‌سی برای بازسازی کامل حجم و کانتور صورت.",
          seoTitle: "پک فول فیس ۸ سی‌سی | قیمت",
          seoDescription:
            "قیمت پک فول فیس ۸ سی‌سی برای بازسازی کامل حجم و کانتور صورت با رویکردی متناسب و متعادل.",
        },
        en: {
          shortDesc: "8cc full face package to fully restore facial volume and contour.",
          seoTitle: "Full Face Package 8cc | Price",
          seoDescription:
            "8cc full face filler package price to fully restore facial volume and contour with a balanced approach.",
        },
      },
    ),
    withSeo(
      svc(
        "full-face-package-signature",
        "پک فول فیس اختصاصی",
        "Signature Full Face Package",
        39_900_000,
        3,
        "from",
      ),
      {
        fa: {
          shortDesc: "پک فول فیس اختصاصی، طراحی‌شده بر اساس آنالیز چهره و نیاز شما.",
          seoTitle: "پک فول فیس اختصاصی | قیمت",
          seoDescription:
            "پک فول فیس اختصاصی بر اساس آنالیز چهره؛ برنامه‌ای کاملاً شخصی‌سازی‌شده برای حجم و تعادل صورت.",
        },
        en: {
          shortDesc: "Signature full face package designed around your facial analysis and goals.",
          seoTitle: "Signature Full Face Package | Price",
          seoDescription:
            "Signature full face filler package built on facial analysis; a fully personalized plan for volume and balance.",
        },
      },
    ),
  ],
};
