import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const LASER_OTHER_BODY_CATEGORY: SeedCategory = {
      slug: "laser-hair-other-body-areas",
      icon: "user",
      displayOrder: 2,
      i18n: [
        {
          locale: "fa",
          name: "سایر نواحی بدن",
          description:
            "لیزر موهای زائد نواحی مختلف بدن شامل زیربغل، ساق، دست، شکم، کمر، بیکینی و پا؛ برای هر ناحیه به‌صورت مجزا.",
          seoTitle: "لیزر موهای زائد بدن | قیمت هر ناحیه",
          seoDescription:
            "قیمت لیزر موهای زائد زیربغل، ساق، دست، شکم، کمر، بیکینی و پا؛ برای هر ناحیه به‌صورت مجزا و با نتیجه‌ای ماندگار.",
        },
        {
          locale: "en",
          name: "Other Body Areas",
          description:
            "Laser hair removal for body areas including underarms, calves, arms, abdomen, back, bikini and legs, each available separately.",
          seoTitle: "Body Laser Hair Removal | Prices by Area",
          seoDescription:
            "Laser hair removal prices for underarms, calves, arms, abdomen, back, bikini and legs — choose your area for lasting results.",
        },
      ],
      services: [
        withSeo(svc("underarm", "زیر بغل", "Underarm", 200_000, 0), {
          fa: {
            shortDesc: "لیزر موهای زائد زیربغل برای پوستی صاف و ماندگار.",
            seoTitle: "لیزر مو زیربغل | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد زیربغل؛ حذف موهای زیربغل با دقت بالا و نتیجه‌ای صاف و ماندگار.",
          },
          en: {
            shortDesc: "Underarm laser hair removal for smooth, long-lasting results.",
            seoTitle: "Underarm Laser Hair Removal | Price",
            seoDescription:
              "Underarm laser hair removal price — precise removal for smooth, long-lasting results.",
          },
        }),
        withSeo(svc("calf", "ساق", "Calf", 200_000, 1), {
          fa: {
            shortDesc: "لیزر موهای زائد ساق پا برای پوستی صاف و ماندگار.",
            seoTitle: "لیزر مو ساق پا | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد ساق پا؛ حذف موهای ساق با دقت بالا و پوستی صاف و ماندگار.",
          },
          en: {
            shortDesc: "Calf laser hair removal for smooth legs.",
            seoTitle: "Calf Laser Hair Removal | Price",
            seoDescription:
              "Calf laser hair removal price — precise hair removal for smooth, long-lasting legs.",
          },
        }),
        withSeo(svc("full-arm", "دست کامل", "Full Arm", 250_000, 2), {
          fa: {
            shortDesc: "لیزر موهای زائد دست کامل از مچ تا شانه.",
            seoTitle: "لیزر مو دست کامل | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد دست کامل؛ حذف موهای دست از مچ تا شانه با دقت بالا و نتیجه‌ای ماندگار.",
          },
          en: {
            shortDesc: "Full arm laser hair removal from wrist to shoulder.",
            seoTitle: "Full Arm Laser Hair Removal | Price",
            seoDescription:
              "Full arm laser hair removal price — from wrist to shoulder for smooth, long-lasting results.",
          },
        }),
        withSeo(svc("abdomen", "شکم", "Abdomen", 155_000, 3), {
          fa: {
            shortDesc: "لیزر موهای زائد شکم برای پوستی صاف.",
            seoTitle: "لیزر مو شکم | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد شکم؛ حذف موهای ناحیه شکم با دقت بالا و نتیجه‌ای صاف و ماندگار.",
          },
          en: {
            shortDesc: "Abdomen laser hair removal for smooth, lasting results.",
            seoTitle: "Abdomen Laser Hair Removal | Price",
            seoDescription:
              "Abdomen laser hair removal price — precise removal for smooth, lasting results.",
          },
        }),
        withSeo(svc("lower-back", "کمر", "Lower Back", 150_000, 4), {
          fa: {
            shortDesc: "لیزر موهای زائد کمر برای پوستی صاف.",
            seoTitle: "لیزر مو کمر | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد کمر؛ حذف موهای ناحیه کمر با دقت بالا و نتیجه‌ای صاف و ماندگار.",
          },
          en: {
            shortDesc: "Lower back laser hair removal for smooth results.",
            seoTitle: "Lower Back Laser Hair Removal | Price",
            seoDescription:
              "Lower back laser hair removal price — precise removal for smooth, lasting results.",
          },
        }),
        withSeo(svc("bikini", "بیکینی", "Bikini", 190_000, 5), {
          fa: {
            shortDesc: "لیزر موهای زائد بیکینی با رعایت استانداردهای بهداشتی.",
            seoTitle: "لیزر مو بیکینی | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد ناحیه بیکینی؛ حذف موها با رعایت استانداردهای بهداشتی و نتیجه‌ای صاف و ماندگار.",
          },
          en: {
            shortDesc: "Bikini laser hair removal with hygienic standards.",
            seoTitle: "Bikini Laser Hair Removal | Price",
            seoDescription:
              "Bikini laser hair removal price — hygienic, precise hair removal for smooth, long-lasting results.",
          },
        }),
        withSeo(svc("lower-leg", "ساق پا", "Lower Leg", 180_000, 6), {
          fa: {
            shortDesc: "لیزر موهای زائد ساق پا برای پوستی صاف و ماندگار.",
            seoTitle: "لیزر مو ساق پا | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد ساق پا؛ حذف موهای ساق با دقت بالا و پوستی صاف و ماندگار.",
          },
          en: {
            shortDesc: "Lower leg laser hair removal for smooth legs.",
            seoTitle: "Lower Leg Laser Hair Removal | Price",
            seoDescription:
              "Lower leg laser hair removal price — precise hair removal for smooth, long-lasting results.",
          },
        }),
        withSeo(svc("full-leg", "پا کامل", "Full Leg", 300_000, 7), {
          fa: {
            shortDesc: "لیزر موهای زائد پا کامل از ران تا مچ.",
            seoTitle: "لیزر مو پا کامل | قیمت",
            seoDescription:
              "قیمت لیزر موهای زائد پا کامل؛ حذف موهای پا از ران تا مچ با دقت بالا و نتیجه‌ای صاف و ماندگار.",
          },
          en: {
            shortDesc: "Full leg laser hair removal from thigh to ankle.",
            seoTitle: "Full Leg Laser Hair Removal | Price",
            seoDescription:
              "Full leg laser hair removal price — from thigh to ankle for smooth, long-lasting results.",
          },
        }),
      ],
};
