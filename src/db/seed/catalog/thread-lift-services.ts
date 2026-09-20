import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const THREAD_LIFT_SERVICES_CATEGORY: SeedCategory = {
  slug: "thread-lift-services",
  icon: "sparkles",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "نخ لیفت صورت",
      description:
        "نخ لیفت برای بهبود افتادگی خفیف پوست و فرم‌دهی طبیعی چهره بدون جراحی؛ متناسب با ناحیه و نیاز شما.",
      seoTitle: "نخ لیفت صورت | لیفت بدون جراحی",
      seoDescription:
        "قیمت نخ لیفت صورت، گردن و فک برای بهبود افتادگی خفیف پوست و فرم‌دهی طبیعی چهره بدون جراحی.",
    },
    {
      locale: "en",
      name: "Face Thread Lift",
      description:
        "Thread lift to improve mild skin laxity and refine facial contours naturally, without surgery.",
      seoTitle: "Face Thread Lift | Non-Surgical Lifting",
      seoDescription:
        "Thread lift prices for the face, neck and jaw to improve mild skin laxity and refine contours without surgery.",
    },
  ],
  services: [
    withSeo(
      svc("thread-lift-face", "نخ لیفت صورت", "Face Thread Lift", 18_900_000, 0, "from"),
      {
        fa: {
          shortDesc: "نخ لیفت صورت برای بهبود افتادگی خفیف و فرم‌دهی طبیعی چهره.",
          seoTitle: "نخ لیفت صورت | قیمت",
          seoDescription:
            "قیمت نخ لیفت صورت برای بهبود افتادگی خفیف پوست و فرم‌دهی طبیعی چهره بدون جراحی.",
        },
        en: {
          shortDesc: "Face thread lift to improve mild laxity and naturally redefine facial contours.",
          seoTitle: "Face Thread Lift | Price",
          seoDescription:
            "Face thread lift price to improve mild skin laxity and naturally refine facial contours without surgery.",
        },
      },
    ),
    withSeo(
      svc(
        "thread-lift-jawline",
        "نخ لیفت خط فک و غبغب",
        "Jawline & Double Chin Thread Lift",
        14_900_000,
        1,
        "from",
      ),
      {
        fa: {
          shortDesc: "نخ لیفت خط فک و غبغب برای فرم‌دهی و سفتی ناحیه زیر چانه.",
          seoTitle: "نخ لیفت خط فک و غبغب | قیمت",
          seoDescription:
            "قیمت نخ لیفت خط فک و غبغب برای فرم‌دهی، سفتی و بهبود تعریف ناحیه زیر چانه بدون جراحی.",
        },
        en: {
          shortDesc: "Jawline and double chin thread lift to define and firm the area under the chin.",
          seoTitle: "Jawline & Double Chin Thread Lift | Price",
          seoDescription:
            "Jawline and double chin thread lift price to define, firm and improve the area under the chin without surgery.",
        },
      },
    ),
    withSeo(
      svc("thread-lift-neck", "نخ لیفت گردن", "Neck Thread Lift", 13_900_000, 2, "from"),
      {
        fa: {
          shortDesc: "نخ لیفت گردن برای بهبود افتادگی و جوان‌تر شدن ظاهر ناحیه گردن.",
          seoTitle: "نخ لیفت گردن | قیمت",
          seoDescription:
            "قیمت نخ لیفت گردن برای بهبود افتادگی خفیف پوست و جوان‌تر شدن ظاهر ناحیه گردن.",
        },
        en: {
          shortDesc: "Neck thread lift to improve laxity and refresh the appearance of the neck.",
          seoTitle: "Neck Thread Lift | Price",
          seoDescription:
            "Neck thread lift price to improve mild skin laxity and rejuvenate the appearance of the neck.",
        },
      },
    ),
    withSeo(
      svc(
        "thread-lift-forehead-brow",
        "نخ لیفت پیشانی و ابرو",
        "Forehead & Brow Thread Lift",
        16_900_000,
        3,
        "from",
      ),
      {
        fa: {
          shortDesc: "نخ لیفت پیشانی و ابرو برای بالا کشیدن و باز کردن نگاه.",
          seoTitle: "نخ لیفت پیشانی و ابرو | قیمت",
          seoDescription:
            "قیمت نخ لیفت پیشانی و ابرو برای لیفت ملایم و بازتر شدن نگاه بدون جراحی.",
        },
        en: {
          shortDesc: "Forehead and brow thread lift to subtly lift and open up the eye area.",
          seoTitle: "Forehead & Brow Thread Lift | Price",
          seoDescription:
            "Forehead and brow thread lift price for a subtle lift and a more open, refreshed look.",
        },
      },
    ),
    withSeo(
      svc("thread-lift-cheek", "نخ لیفت گونه", "Cheek Thread Lift", 15_900_000, 4, "from"),
      {
        fa: {
          shortDesc: "نخ لیفت گونه برای بازگرداندن فرم و تعریف ناحیه گونه.",
          seoTitle: "نخ لیفت گونه | قیمت",
          seoDescription:
            "قیمت نخ لیفت گونه برای بازگرداندن فرم، تعریف و سفتی ناحیه گونه بدون جراحی.",
        },
        en: {
          shortDesc: "Cheek thread lift to restore mid-face definition and firmness.",
          seoTitle: "Cheek Thread Lift | Price",
          seoDescription:
            "Cheek thread lift price to restore mid-face definition, contour and firmness without surgery.",
        },
      },
    ),
    withSeo(
      svc(
        "thread-lift-full-face",
        "نخ لیفت کامل صورت",
        "Full Face Thread Lift",
        29_900_000,
        5,
        "from",
      ),
      {
        fa: {
          shortDesc: "نخ لیفت کامل صورت برای لیفت هماهنگ چند ناحیه در یک برنامه.",
          seoTitle: "نخ لیفت کامل صورت | قیمت",
          seoDescription:
            "قیمت نخ لیفت کامل صورت برای لیفت هماهنگ چند ناحیه و نتیجه‌ای طبیعی و متعادل.",
        },
        en: {
          shortDesc: "Full face thread lift for a coordinated lift across multiple facial areas.",
          seoTitle: "Full Face Thread Lift | Price",
          seoDescription:
            "Full face thread lift price for a coordinated lift across multiple areas with a natural, balanced result.",
        },
      },
    ),
  ],
};
