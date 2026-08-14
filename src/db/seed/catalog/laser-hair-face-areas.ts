import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const LASER_FACE_AREAS_CATEGORY: SeedCategory = {
      slug: "laser-hair-face-areas",
      icon: "smile",
      displayOrder: 1,
      i18n: [
        {
          locale: "fa",
          name: "نواحی صورت",
          description:
            "لیزر موهای زائد نواحی صورت شامل صورت کامل، پشت لب، چانه و غبغب با دقت بالا و نتیجه‌ای ماندگار.",
          seoTitle: "لیزر مو صورت | قیمت هر ناحیه",
          seoDescription:
            "قیمت لیزر موهای زائد صورت؛ صورت کامل، پشت لب، چانه و غبغب با دقت بالا و نتیجه‌ای ماندگار.",
        },
        {
          locale: "en",
          name: "Face Areas",
          description:
            "Facial laser hair removal for areas such as full face, upper lip, chin and double chin with precise, long-lasting results.",
          seoTitle: "Facial Laser Hair Removal | Prices",
          seoDescription:
            "Facial laser hair removal prices for full face, upper lip, chin and double chin — precise and long-lasting results.",
        },
      ],
      services: [
        withSeo(svc("face-full", "صورت", "Face", 150_000, 0), {
          fa: {
            shortDesc: "لیزر موهای زائد صورت کامل برای حذف موهای صورت با دقت بالا.",
            seoTitle: "لیزر مو صورت کامل | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد صورت کامل؛ حذف موهای صورت با دقت بالا، پوستی صاف و نتیجه‌ای ماندگار.",
          },
          en: {
            shortDesc: "Full face laser hair removal for precise, long-lasting hair removal.",
            seoTitle: "Full Face Laser Hair Removal | Price",
            seoDescription:
              "Full face laser hair removal price — precise removal of facial hair for smooth skin and long-lasting results.",
          },
        }),
        withSeo(svc("upper-lip", "پشت لب", "Upper Lip", 90_000, 1), {
          fa: {
            shortDesc: "لیزر موهای زائد پشت لب، روشی سریع و بدون درد.",
            seoTitle: "لیزر پشت لب | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد پشت لب؛ روشی سریع و بدون درد برای حذف موهای زیر بینی با نتیجه‌ای ماندگار.",
          },
          en: {
            shortDesc: "Upper lip laser hair removal — a quick, gentle hair removal method.",
            seoTitle: "Upper Lip Laser Hair Removal | Price",
            seoDescription:
              "Upper lip laser hair removal price — a quick, gentle way to remove unwanted hair below the nose with lasting results.",
          },
        }),
        withSeo(svc("chin-area", "چانه", "Chin", 90_000, 2), {
          fa: {
            shortDesc: "لیزر موهای زائد چانه برای حذف موهای مزاحم چانه.",
            seoTitle: "لیزر مو چانه | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد چانه؛ حذف موهای مزاحم چانه با دقت بالا و نتیجه‌ای تمیز و ماندگار.",
          },
          en: {
            shortDesc: "Chin laser hair removal for clean, precise results.",
            seoTitle: "Chin Laser Hair Removal | Price",
            seoDescription:
              "Chin laser hair removal price — precise removal of unwanted chin hair for clean, long-lasting results.",
          },
        }),
        withSeo(svc("sideburn", "غبغب", "Double Chin", 90_000, 3), {
          fa: {
            shortDesc: "لیزر موهای زائد غبغب و ناحیه زیر چانه.",
            seoTitle: "لیزر مو غبغب | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد غبغب و ناحیه زیر چانه؛ حذف موهای مزاحم با دقت و نتیجه‌ای ماندگار.",
          },
          en: {
            shortDesc: "Double chin laser hair removal for the area under the chin.",
            seoTitle: "Double Chin Laser Hair Removal | Price",
            seoDescription:
              "Double chin laser hair removal price — precise removal of unwanted hair under the chin for lasting results.",
          },
        }),
      ],
};
