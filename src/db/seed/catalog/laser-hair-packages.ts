import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const LASER_PACKAGES_CATEGORY: SeedCategory = {
      slug: "laser-hair-packages",
      icon: "package",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "پکیج ها",
          description:
            "پکیج‌های لیزر مو شامل کاربردی، فول کاربردی و فول بادی برای پوشش کامل نواحی موردنظر با بهترین نتیجه.",
          seoTitle: "پکیج لیزر مو | قیمت و مشخصات",
          seoDescription:
            "قیمت پکیج‌های لیزر مو؛ کاربردی، فول کاربردی و فول بادی برای پوشش کامل نواحی موردنظر با بهترین نتیجه.",
        },
        {
          locale: "en",
          name: "Packages",
          description:
            "Laser hair removal packages — practical, full practical and full body — for complete coverage of your target areas with the best results.",
          seoTitle: "Laser Hair Removal Packages | Prices",
          seoDescription:
            "Laser hair removal package prices: practical, full practical and full body plans for complete coverage of your target areas.",
        },
      ],
      services: [
        withSeo(
          svc(
            "package-karbordi",
            "کاربردی (ساق، ساعد، بیکینی، زیربغل)",
            "Practical Package (Calf, Forearm, Bikini, Underarm)",
            790_000,
            0,
          ),
          {
            fa: {
              shortDesc: "پکیج کاربردی لیزر مو شامل ساق، ساعد، بیکینی و زیربغل با قیمت مناسب.",
              seoTitle: "پکیج کاربردی لیزر | قیمت",
              seoDescription:
                "پکیج کاربردی لیزر مو شامل ساق، ساعد، بیکینی و زیربغل؛ با قیمت مناسب برای پوشش نواحی اصلی و موردنیاز شما.",
            },
            en: {
              shortDesc: "Practical laser package covering calves, forearms, bikini and underarms at a great price.",
              seoTitle: "Practical Laser Package | Price",
              seoDescription:
                "Practical laser hair removal package covering calves, forearms, bikini and underarms at a great price for your key areas.",
            },
          },
        ),
        withSeo(
          svc(
            "package-full-karbordi",
            "فول کاربردی (دست، پا، بیکینی، زیربغل)",
            "Full Practical Package (Arms, Legs, Bikini, Underarm)",
            880_000,
            1,
          ),
          {
            fa: {
              shortDesc: "پکیج فول کاربردی لیزر مو شامل دست، پا، بیکینی و زیربغل.",
              seoTitle: "پکیج فول کاربردی لیزر | قیمت",
              seoDescription:
                "پکیج فول کاربردی لیزر مو شامل دست، پا، بیکینی و زیربغل؛ پوشش کامل نواحی پرکاربرد با یک قیمت به‌صرفه.",
            },
            en: {
              shortDesc: "Full practical laser package covering arms, legs, bikini and underarms.",
              seoTitle: "Full Practical Laser Package | Price",
              seoDescription:
                "Full practical laser hair removal package covering arms, legs, bikini and underarms — complete coverage at one great price.",
            },
          },
        ),
        withSeo(
          svc(
            "package-full-body",
            "فول بادی (از پیشانی تا انگشت پا)",
            "Full Body Package (Forehead to Toes)",
            990_000,
            2,
          ),
          {
            fa: {
              shortDesc: "پکیج فول بادی لیزر مو از پیشانی تا انگشت پا برای پوشش کامل بدن.",
              seoTitle: "پکیج فول بادی لیزر | قیمت",
              seoDescription:
                "پکیج فول بادی لیزر مو از پیشانی تا انگشت پا؛ کامل‌ترین گزینه برای حذف موهای زائد کل بدن با یک قیمت.",
            },
            en: {
              shortDesc: "Full body laser package from forehead to toes for complete body coverage.",
              seoTitle: "Full Body Laser Package | Price",
              seoDescription:
                "Full body laser hair removal from forehead to toes — the most complete option for removing unwanted hair at one price.",
            },
          },
        ),
      ],
};
